"""Convierte data/indicadores_2026.csv en data/indicadores_2026.js, que es lo que lee el tablero.

Uso (desde la carpeta del proyecto):
    python herramientas/csv_a_js.py
"""
import csv, json, pathlib

base = pathlib.Path(__file__).resolve().parent.parent
campos = ['secretaria', 'codigo', 'indicador', 'unidad', 'tipo', 'meta_2026', 'cierre_2026', 'cumplimiento_2026', 'estado', 'calculo']
with open(base / 'data' / 'indicadores_2026.csv', encoding='utf-8') as f:
    filas = [{k: r.get(k, '') for k in campos} for r in csv.DictReader(f)]
js = 'window.PDM_DATA = ' + json.dumps(filas, ensure_ascii=False, indent=1) + ';\n'
(base / 'data' / 'indicadores_2026.js').write_text(js, encoding='utf-8')
print(f'{len(filas)} indicadores escritos en data/indicadores_2026.js')
