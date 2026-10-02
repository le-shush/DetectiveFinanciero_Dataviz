"""Paso 1: lee las hojas ">>" del Excel -> assets/Comparativo_Industrias_Averages.xlsx + data/data_industrias.json"""
import openpyxl, json, math
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.chart import BarChart, Reference

import sys
SRC = sys.argv[1] if len(sys.argv)>1 else 'data/20261001_Detective_Financiero_v3.xlsx'
OUT_X = 'assets/Comparativo_Industrias_Averages.xlsx'


wb = openpyxl.load_workbook(SRC, data_only=True)
sheets = {'O&G': 'O&G>>', 'Biotech': 'Biotech>>', 'Tecnología': 'Technology>>', 'Pharma': 'Pharma>>'}

# Category mapping (row label -> category); order preserved
CATS = [
 ('Activos', ['Cash & Cash Equivalents','Short-Term Investments - Total','Trade Accounts & Trade Notes Receivable - Net',
              'Inventories - Total','Other Current Assets','Total Current Assets','Investments - Long-Term',
              'Property, Plant & Equipment - Net - Total','Intangible Assets - Total - Net','Other Non-Current Assets',
              'Total Non-Current Assets','Total Assets']),
 ('Pasivos', ['Trade Accounts & Trade Notes Payable - Short-Term','Short-Term Debt & Current Portion of Long-Term Debt',
              'Other Current Liabilities','Total Current Liabilities','Debt - Long-Term - Total','Other Non-Current Liabilities',
              'Total Non-Current Liabilities','Total Liabilities']),
 ('Capital', ['Common Equity - Total',"Other Shareholders' Equity","Total Shareholders' Equity - including Minority Interest & Hybrid Debt",
              'Total Liabilities & Equity']),
 ('Ingresos', ['Revenue from Business Activities - Total','Cost of Sales','Gross Profit - Industrials/Property - Total']),
 ('Gastos', ['Selling, General & Administrative Expenses excluding Research & Development Expenses',
             'Research & Development Expense - Supplemental','Other (operativo)','Operating Expenses - Total',
             'Depreciation, Depletion & Amortization - Total','Interest Expense - Net of (Interest Income)','Other (no operativo)']),
 ('Utilidad e Impuestos', ['Earnings before Interest & Taxes (EBIT)','Earnings before Interest, Taxes, Depreciation & Amortization (EBITDA)',
                          'Income before Taxes','Income Taxes','Other (después de impuestos)','Net Income after Minority Interest']),
 ('Indicadores: Liquidez', ['Razón corriente (CR)','Prueba ácida (QR)','Capital de trabajo neto (NWC) (USD mm)']),
 ('Indicadores: Eficiencia', ['Rotación de inventario (ITR)','Rotación de activos fijos netos (FAT)','Rotación de activos totales (ATR)',
                             'Días promedio de cartera (DSO)','Días promedio de inventario (DIO)','Periodo promedio de pago (DPO)','Ciclo operativo (OC)','Ciclo de efectivo (CC)']),
 ('Indicadores: Apalancamiento', ['Nivel de endeudamiento (Debt to Assets)','Cobertura de intereses (Interest Coverage)']),
 ('Indicadores: Rentabilidad', ['Margen neto (NPM)','Margen operacional (OM)','ROA','ROE','ROC','ROIC','ROCE']),
]
SHORT = {
 'Cash & Cash Equivalents':'Efectivo','Short-Term Investments - Total':'Inversiones CP','Trade Accounts & Trade Notes Receivable - Net':'Cuentas por cobrar',
 'Inventories - Total':'Inventarios','Other Current Assets':'Otros act. circulantes','Total Current Assets':'Total act. circulante',
 'Investments - Long-Term':'Inversiones LP','Property, Plant & Equipment - Net - Total':'PP&E neto','Intangible Assets - Total - Net':'Intangibles',
 'Other Non-Current Assets':'Otros act. no circulantes','Total Non-Current Assets':'Total act. no circulante','Total Assets':'Total activos',
 'Trade Accounts & Trade Notes Payable - Short-Term':'Cuentas por pagar','Short-Term Debt & Current Portion of Long-Term Debt':'Deuda CP',
 'Other Current Liabilities':'Otros pas. circulantes','Total Current Liabilities':'Total pas. circulante','Debt - Long-Term - Total':'Deuda LP',
 'Other Non-Current Liabilities':'Otros pas. no circulantes','Total Non-Current Liabilities':'Total pas. no circulante','Total Liabilities':'Total pasivos',
 'Common Equity - Total':'Capital común',"Other Shareholders' Equity":'Otro capital',
 "Total Shareholders' Equity - including Minority Interest & Hybrid Debt":'Total capital','Total Liabilities & Equity':'Pasivo + Capital',
 'Revenue from Business Activities - Total':'Ingresos','Cost of Sales':'Costo de ventas','Gross Profit - Industrials/Property - Total':'Utilidad bruta',
 'Selling, General & Administrative Expenses excluding Research & Development Expenses':'SG&A','Research & Development Expense - Supplemental':'I+D',
 'Other (operativo)':'Otros gastos operativos','Operating Expenses - Total':'Total gastos operativos',
 'Depreciation, Depletion & Amortization - Total':'Depreciación y amortización','Interest Expense - Net of (Interest Income)':'Gasto por intereses (neto)',
 'Other (no operativo)':'Otros (no operativos)','Earnings before Interest & Taxes (EBIT)':'EBIT',
 'Earnings before Interest, Taxes, Depreciation & Amortization (EBITDA)':'EBITDA','Income before Taxes':'Utilidad antes de impuestos',
 'Income Taxes':'Impuestos','Other (después de impuestos)':'Otros (después de impuestos)','Net Income after Minority Interest':'Utilidad neta',
 'Razón corriente (CR)':'Razón corriente','Prueba ácida (QR)':'Prueba ácida','Capital de trabajo neto (NWC) (USD mm)':'Capital de trabajo neto (USD mm)',
 'Rotación de inventario (ITR)':'Rotación de inventario','Rotación de activos fijos netos (FAT)':'Rotación de activos fijos netos','Rotación de activos totales (ATR)':'Rotación de activos totales',
 'Días promedio de cartera (DSO)':'Días de cuentas por cobrar','Días promedio de inventario (DIO)':'Días de inventario','Periodo promedio de pago (DPO)':'Días de cuentas por pagar',
 'Ciclo operativo (OC)':'Ciclo operativo','Ciclo de efectivo (CC)':'Ciclo de efectivo','Nivel de endeudamiento (Debt to Assets)':'Nivel de endeudamiento',
 'Cobertura de intereses (Interest Coverage)':'Cobertura de intereses','Margen neto (NPM)':'Margen neto','Margen operacional (OM)':'Margen operacional',
 'ROA':'ROA','ROE':'ROE','ROC':'ROC','ROIC':'ROIC','ROCE':'ROCE',
}
KPI_FMT = {'Razón corriente (CR)':'x','Prueba ácida (QR)':'x','Capital de trabajo neto (NWC) (USD mm)':'usd',
 'Rotación de inventario (ITR)':'x','Rotación de activos fijos netos (FAT)':'x','Rotación de activos totales (ATR)':'x',
 'Días promedio de cartera (DSO)':'días','Días promedio de inventario (DIO)':'días','Periodo promedio de pago (DPO)':'días','Ciclo operativo (OC)':'días','Ciclo de efectivo (CC)':'días',
 'Nivel de endeudamiento (Debt to Assets)':'pct','Cobertura de intereses (Interest Coverage)':'x',
 'Margen neto (NPM)':'pct','Margen operacional (OM)':'pct','ROA':'pct','ROE':'pct','ROC':'pct','ROIC':'pct','ROCE':'pct'}

def parse(ws):
    """Return ordered list of (label, avg, [c1,c2,c3]), companies, notes"""
    rows = [r for r in ws.iter_rows(min_col=2, max_col=7, values_only=True) if any(c is not None for c in r)]
    comps = [rows[0][2], rows[0][3], rows[0][4], rows[0][5]]
    out = {}; notes = {}
    other_i = 0; sect = None
    for r in rows[1:]:
        lab = r[0]
        if lab is None: continue
        if lab in ('Balance Sheet','Financial Statement','KPI','Check') or lab.startswith(('Indicadores de','Administración de')): sect = lab; continue
        if lab == '—' or lab == 'Other':
            key = ['Other (operativo)','Other (no operativo)','Other (después de impuestos)'][other_i]; other_i += 1
        else: key = lab
        avg = r[1]; vals = [r[2], r[3], r[4], r[5]]
        def num(v): return v if isinstance(v,(int,float)) else None
        vals = [num(v) for v in vals]
        if not isinstance(avg,(int,float)):
            valid = [v for v in vals if v is not None]
            avg = sum(valid)/len(valid) if valid else None
            notes[key] = f'Promedio recalculado con {len(valid)} empresas (en el libro sale #DIV/0!)'
        out[key] = (avg, vals)
    return out, comps, notes

data = {}; companies = {}; notes = {}
for ind, sh in sheets.items():
    d, c, n = parse(wb[sh]); data[ind] = d; companies[ind] = c; notes[ind] = n
inds = list(sheets.keys())

# Biotech: identify companies with no revenue to mention
bio_no_rev = [companies['Biotech'][i] for i,v in enumerate(data['Biotech']['Revenue from Business Activities - Total'][1]) if not v]

# ---------------- EXCEL ----------------
wbo = openpyxl.Workbook()
ws = wbo.active; ws.title = 'Comparativo Averages'
COLORS = {'O&G':'2A78D6','Biotech':'EB6834','Tecnología':'1BAF7A','Pharma':'EDA100'}
hdr_fill = PatternFill('solid', fgColor='1F2937'); hdr_font = Font(bold=True, color='FFFFFF')
cat_fill = PatternFill('solid', fgColor='E5E7EB'); thin = Side(style='thin', color='D1D5DB')
ws.append(['Categoría','Item (original)','Item (corto)'] + inds + ['Unidad','Nota'])
for i,c in enumerate(ws[1],1):
    c.fill = hdr_fill; c.font = hdr_font; c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
for j,ind in enumerate(inds):
    ws.cell(1, 4+j).fill = PatternFill('solid', fgColor=COLORS[ind])
r = 2
cat_ranges = {}
for cat, items in CATS:
    ws.append([cat]);
    for c in ws[r]: c.fill = cat_fill; c.font = Font(bold=True)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=3+len(inds)+2)
    r += 1; start = r
    for it in items:
        unit = KPI_FMT.get(it, '% del total activos' if cat in ('Activos','Pasivos','Capital') else '% de ingresos')
        note = '; '.join(f'{ind}: {notes[ind][it]}' for ind in inds if it in notes[ind])
        row = [cat, it, SHORT[it]] + [data[ind][it][0] for ind in inds] + [unit, note]
        ws.append(row)
        for j in range(len(inds)):
            cell = ws.cell(r, 4+j)
            if unit in ('% del total activos','% de ingresos','pct'): cell.number_format = '0.0%'
            elif unit == 'días': cell.number_format = '0.0'
            elif unit == 'usd': cell.number_format = '#,##0'
            else: cell.number_format = '0.00'
            cell.alignment = Alignment(horizontal='right')
        if it.startswith('Total') or it in ('Net Income after Minority Interest','Earnings before Interest & Taxes (EBIT)','Gross Profit - Industrials/Property - Total'):
            for c in ws[r]: c.font = Font(bold=True)
        r += 1
    cat_ranges[cat] = (start, r-1)
for row in ws.iter_rows(min_row=1, max_row=r-1):
    for c in row: c.border = Border(top=thin,bottom=thin,left=thin,right=thin)
widths = [16, 58, 28, 13, 13, 13, 13, 18, 60]
for i,w in enumerate(widths,1): ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = 'D2'
# notes block
r += 1
ws.cell(r,1,'Notas').font = Font(bold=True); r+=1
ws.cell(r,1,'• Balance: cada partida como % del Total de Activos. Estado de resultados: cada partida como % de Ingresos. Indicadores: en sus unidades (veces, días, % o USD mm). Promedio simple de 4 empresas por industria.'); r+=1
ws.cell(r,1,f'• Empresas por industria: ' + ' | '.join(f"{ind}: {', '.join(companies[ind])}" for ind in inds)); r+=1
if bio_no_rev: ws.cell(r,1,f'• Biotech: {", ".join(bio_no_rev)} no reporta ingresos (etapa pre-comercial), por lo que los promedios del estado de resultados en el libro original marcan #DIV/0!; aquí se recalcularon con las empresas con ingresos. Los indicadores de Biotech sí se toman tal cual del libro (incluyen ceros de RVMD).')

# Company detail sheet
wd = wbo.create_sheet('Detalle por empresa')
hdr = ['Categoría','Item']
for ind in inds: hdr += [f'{ind} · {c}' for c in companies[ind]] + [f'{ind} · Average']
wd.append(hdr)
for c in wd[1]: c.fill = hdr_fill; c.font = hdr_font; c.alignment = Alignment(wrap_text=True, horizontal='center')
rr = 2
for cat, items in CATS:
    for it in items:
        row = [cat, SHORT[it]]
        for ind in inds: row += data[ind][it][1] + [data[ind][it][0]]
        wd.append(row)
        u = KPI_FMT.get(it,'pct'); fmt = '0.0%' if u=='pct' else ('0.0' if u=='días' else ('#,##0' if u=='usd' else '0.00'))
        for j in range(3, 3+5*len(inds)): wd.cell(rr, j).number_format = fmt
        rr += 1
wd.column_dimensions['A'].width = 16; wd.column_dimensions['B'].width = 30
for j in range(3, 3+5*len(inds)): wd.column_dimensions[get_column_letter(j)].width = 14
wd.freeze_panes = 'C2'

# Native charts sheet
wc = wbo.create_sheet('Gráficos')
pos = 1
for cat, (a,b) in cat_ranges.items():
    ch = BarChart(); ch.type = 'col'; ch.grouping = 'clustered'
    ch.title = f'{cat} — promedio por industria'; ch.height = 9; ch.width = 26
    dref = Reference(ws, min_col=4, max_col=3+len(inds), min_row=1, max_row=1)  # headers
    for j,ind in enumerate(inds):
        s_ref = Reference(ws, min_col=4+j, min_row=a, max_row=b)
        from openpyxl.chart import Series
        s = Series(s_ref, title=ind); s.graphicalProperties.solidFill = COLORS[ind]
        ch.series.append(s)
    ch.set_categories(Reference(ws, min_col=3, min_row=a, max_row=b))
    ch.y_axis.number_format = '0%' if not cat.startswith('Indicadores') else '0.0'
    ch.x_axis.tickLblPos = 'low'
    wc.add_chart(ch, f'A{pos}'); pos += 20
wbo.save(OUT_X)

# ---------------- JSON for HTML ----------------
payload = {'inds': inds, 'companies': companies, 'colors': {k:'#'+v for k,v in COLORS.items()},
           'cats': [{'name':cat, 'items':[{'key':it,'short':SHORT[it],'unit':KPI_FMT.get(it,'pct'),
                     'avg':[data[ind][it][0] for ind in inds],
                     'comp':{ind: data[ind][it][1] for ind in inds}} for it in items]} for cat,items in CATS],
           'bio_no_rev': bio_no_rev}
json.dump(payload, open('data/data_industrias.json','w',encoding='utf-8'), ensure_ascii=False)
print('ok', bio_no_rev)
