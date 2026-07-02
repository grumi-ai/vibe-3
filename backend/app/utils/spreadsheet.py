from __future__ import annotations

import csv
import posixpath
import re
import uuid
import zipfile
from collections import OrderedDict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable
from xml.etree import ElementTree as ET

XLSX_NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkg": "http://schemas.openxmlformats.org/package/2006/relationships",
}

ET.register_namespace("", XLSX_NS["main"])
ET.register_namespace("r", XLSX_NS["rel"])


@dataclass(slots=True)
class TableData:
    headers: list[str]
    rows: list[dict[str, str]]


def slugify(value: str) -> str:
    value = re.sub(r"[^\w\uac00-\ud7a3]+", "-", value, flags=re.UNICODE).strip("-")
    return value or "sheet"


def _column_index_to_name(index: int) -> str:
    name = ""
    index += 1
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


def _parse_cell_reference(reference: str) -> int:
    match = re.match(r"([A-Z]+)", reference)
    if not match:
        return 0
    column = match.group(1)
    value = 0
    for char in column:
        value = value * 26 + (ord(char) - 64)
    return value - 1


def _read_csv(path: Path) -> TableData:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        headers = reader.fieldnames or []
        rows = [{key: (row.get(key) or "") for key in headers} for row in reader]
    return TableData(headers=headers, rows=rows)


def _read_xlsx(path: Path) -> TableData:
    with zipfile.ZipFile(path) as archive:
        shared_strings = _read_shared_strings(archive)
        sheet_path = _resolve_first_sheet_path(archive)
        sheet_xml = ET.fromstring(archive.read(sheet_path))

    rows: list[dict[str, str]] = []
    headers: list[str] = []
    for row_element in sheet_xml.findall(".//main:sheetData/main:row", XLSX_NS):
        values: dict[int, str] = {}
        for cell in row_element.findall("main:c", XLSX_NS):
            reference = cell.attrib.get("r", "")
            index = _parse_cell_reference(reference)
            values[index] = _read_xlsx_cell_value(cell, shared_strings)
        if not headers:
            headers = [values.get(index, "") for index in range(max(values.keys(), default=-1) + 1)]
            headers = [header if header else f"column_{index + 1}" for index, header in enumerate(headers)]
            continue
        row = {header: values.get(index, "") for index, header in enumerate(headers)}
        rows.append(row)

    return TableData(headers=headers, rows=rows)


def _read_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    try:
        shared_strings_xml = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    except KeyError:
        return []

    values: list[str] = []
    for item in shared_strings_xml.findall("main:si", XLSX_NS):
        texts = [text.text or "" for text in item.findall(".//main:t", XLSX_NS)]
        values.append("".join(texts))
    return values


def _resolve_first_sheet_path(archive: zipfile.ZipFile) -> str:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    sheets = workbook.find("main:sheets", XLSX_NS)
    if sheets is None:
        raise ValueError("Workbook has no sheets")
    sheet = sheets.find("main:sheet", XLSX_NS)
    if sheet is None:
        raise ValueError("Workbook has no sheets")
    relationship_id = sheet.attrib.get(f"{{{XLSX_NS['rel']}}}id")
    if not relationship_id:
        raise ValueError("Workbook sheet has no relationship id")

    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    for rel in rels.findall("pkg:Relationship", XLSX_NS):
        if rel.attrib.get("Id") == relationship_id:
            target = rel.attrib.get("Target")
            if not target:
                break
            return posixpath.normpath(posixpath.join("xl", target))
    raise ValueError("Unable to resolve workbook sheet")


def _read_xlsx_cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    value_element = cell.find("main:v", XLSX_NS)
    if cell_type == "s" and value_element is not None:
        index = int(value_element.text or "0")
        return shared_strings[index] if index < len(shared_strings) else ""
    if cell_type == "inlineStr":
        text_element = cell.find("main:is/main:t", XLSX_NS)
        return text_element.text or "" if text_element is not None else ""
    if value_element is not None:
        return value_element.text or ""
    return ""


def read_table(path: Path) -> TableData:
    suffix = path.suffix.lower()
    if suffix == ".csv":
        return _read_csv(path)
    if suffix == ".xlsx":
        return _read_xlsx(path)
    raise ValueError(f"Unsupported spreadsheet format: {path.suffix}")


def _cell_xml(row_index: int, column_index: int, value: Any) -> ET.Element:
    cell = ET.Element(f"{{{XLSX_NS['main']}}}c", {"r": f"{_column_index_to_name(column_index)}{row_index}"})
    if value is None:
        return cell
    if isinstance(value, bool):
        cell.set("t", "b")
        value_element = ET.SubElement(cell, f"{{{XLSX_NS['main']}}}v")
        value_element.text = "1" if value else "0"
        return cell
    if isinstance(value, (int, float)):
        value_element = ET.SubElement(cell, f"{{{XLSX_NS['main']}}}v")
        value_element.text = str(value)
        return cell

    cell.set("t", "inlineStr")
    is_element = ET.SubElement(cell, f"{{{XLSX_NS['main']}}}is")
    t_element = ET.SubElement(is_element, f"{{{XLSX_NS['main']}}}t")
    t_element.text = str(value)
    return cell


def write_xlsx(path: Path, headers: list[str], rows: Iterable[dict[str, Any]], sheet_name: str = "Sheet1") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    sheet_data = ET.Element(f"{{{XLSX_NS['main']}}}worksheet")
    sheet_data.set("xmlns:r", XLSX_NS["rel"])
    sheet_data_element = ET.SubElement(sheet_data, f"{{{XLSX_NS['main']}}}sheetData")

    header_row = ET.SubElement(sheet_data_element, f"{{{XLSX_NS['main']}}}row", {"r": "1"})
    for index, header in enumerate(headers):
        header_row.append(_cell_xml(1, index, header))

    for row_index, row in enumerate(rows, start=2):
        row_element = ET.SubElement(sheet_data_element, f"{{{XLSX_NS['main']}}}row", {"r": str(row_index)})
        for column_index, header in enumerate(headers):
            row_element.append(_cell_xml(row_index, column_index, row.get(header, "")))

    workbook_xml = ET.Element(f"{{{XLSX_NS['main']}}}workbook")
    sheets = ET.SubElement(workbook_xml, f"{{{XLSX_NS['main']}}}sheets")
    ET.SubElement(
        sheets,
        f"{{{XLSX_NS['main']}}}sheet",
        {"name": sheet_name, "sheetId": "1", f"{{{XLSX_NS['rel']}}}id": "rId1"},
    )

    workbook_rels = ET.Element("Relationships", xmlns=XLSX_NS["pkg"])
    ET.SubElement(
        workbook_rels,
        "Relationship",
        {
            "Id": "rId1",
            "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
            "Target": "worksheets/sheet1.xml",
        },
    )

    root_rels = ET.Element("Relationships", xmlns=XLSX_NS["pkg"])
    ET.SubElement(
        root_rels,
        "Relationship",
        {
            "Id": "rId1",
            "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
            "Target": "xl/workbook.xml",
        },
    )

    content_types = ET.Element("Types", xmlns="http://schemas.openxmlformats.org/package/2006/content-types")
    ET.SubElement(content_types, "Default", Extension="rels", ContentType="application/vnd.openxmlformats-package.relationships+xml")
    ET.SubElement(content_types, "Default", Extension="xml", ContentType="application/xml")
    ET.SubElement(
        content_types,
        "Override",
        PartName="/xl/workbook.xml",
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
    )
    ET.SubElement(
        content_types,
        "Override",
        PartName="/xl/worksheets/sheet1.xml",
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
    )

    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", ET.tostring(content_types, encoding="utf-8", xml_declaration=True))
        archive.writestr("_rels/.rels", ET.tostring(root_rels, encoding="utf-8", xml_declaration=True))
        archive.writestr("xl/workbook.xml", ET.tostring(workbook_xml, encoding="utf-8", xml_declaration=True))
        archive.writestr("xl/_rels/workbook.xml.rels", ET.tostring(workbook_rels, encoding="utf-8", xml_declaration=True))
        archive.writestr("xl/worksheets/sheet1.xml", ET.tostring(sheet_data, encoding="utf-8", xml_declaration=True))


def split_rows_by_column(table: TableData, column_name: str) -> "OrderedDict[str, list[dict[str, str]]]":
    if column_name not in table.headers:
        raise ValueError(f"Column '{column_name}' was not found.")

    groups: "OrderedDict[str, list[dict[str, str]]]" = OrderedDict()
    for row in table.rows:
        group_key = row.get(column_name) or "빈값"
        groups.setdefault(group_key, []).append(row)
    return groups


def merge_tables(tables: list[TableData]) -> TableData:
    headers: list[str] = []
    seen: set[str] = set()
    for table in tables:
        for header in table.headers:
            if header not in seen:
                headers.append(header)
                seen.add(header)

    rows: list[dict[str, str]] = []
    for table in tables:
        for row in table.rows:
            rows.append({header: row.get(header, "") for header in headers})
    return TableData(headers=headers, rows=rows)


def build_artifact_filename(prefix: str, suffix: str) -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    return f"{prefix}-{timestamp}-{uuid.uuid4().hex[:8]}{suffix}"
