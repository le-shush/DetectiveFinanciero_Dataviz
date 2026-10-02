"""Paso 2: toma data_industrias.json (de build_excel.py) + hoja Resumen del Excel y produce data/data.json
con industrias (completo), la partida agregada 'Otros act. LP (intang. + otros)', y las empresas A-D (28 partidas)."""
import json, sys, openpyxl
SRC = sys.argv[1] if len(sys.argv)>1 else 'data/20261001_Detective_Financiero_v3.xlsx'
D = json.load(open('data/data_industrias.json',encoding='utf-8'))
ws = openpyxl.load_workbook(SRC, data_only=True)['Resumen']
rows = list(ws.iter_rows(values_only=True))
comp = {}; kpi = False
for r in rows:
    lab = r[1]
    if lab == 'Indicadores Seleccionados': kpi = True; continue
    if lab and all(isinstance(v,(int,float)) for v in r[2:6]): comp[(lab,kpi)] = list(r[2:6])
# (etiqueta en hoja Resumen, es_kpi, nombre corto de la industria con el que se compara)
M = [('Efectivo',False,'Efectivo'),('Inversiones temporales',False,'Inversiones CP'),('Cuentas por cobrar',False,'Cuentas por cobrar'),
 ('Inventarios',False,'Inventarios'),('Otros activos corrientes',False,'Otros act. circulantes'),('Total Activo Corriente/Total Activos',False,'Total act. circulante'),
 ('PPE neto/Total Activos',False,'PP&E neto'),('Inversiones a largo plazo/Total Activos',False,'Inversiones LP'),('Otros Activos a largo Plazo',False,'Otros act. LP (intang. + otros)'),
 ('Total Activo No Corriente/Total Activos',False,'Total act. no circulante'),('Cuentas por pagar/Total Activo',False,'Cuentas por pagar'),
 ('Obligaciones financieras CP/Total Activo',False,'Deuda CP'),('Otros pasivos corto plazo/Total Activo',False,'Otros pas. circulantes'),
 ('Pasivo corriente/Total Activo',False,'Total pas. circulante'),('Obligaciones financieras LP/Total Activo',False,'Deuda LP'),
 ('Otros pasivos LP/Total Activo',False,'Otros pas. no circulantes'),('Pasivo No corriente/Total Activo',False,'Total pas. no circulante'),
 ('Total pasivo/Total Activo',False,'Total pasivos'),('Capital suscrito/Total Activo',False,'Capital común'),('Total patrimonio/Total Activo',False,'Total capital'),
 ('ROE',True,'ROE'),('Margen operacional',True,'Margen operacional'),('Prueba Acida',True,'Prueba ácida'),('Razon corriente',True,'Razón corriente'),
 ('Días de inventario',True,'Días de inventario'),('Días de cuentas por cobrar',True,'Días de cuentas por cobrar'),
 ('Rotación de activos totales',True,'Rotación de activos totales'),('Rotación de activos fijos netos',True,'Rotación de activos fijos netos')]
act = [c for c in D['cats'] if c['name']=='Activos'][0]
idx = [i for i,it in enumerate(act['items']) if it['short']=='Otros act. no circulantes'][0]
intang = [it for it in act['items'] if it['short']=='Intangibles'][0]; otros = act['items'][idx]
act['items'].insert(idx+1, {'key':'__agg_otros_lp','short':'Otros act. LP (intang. + otros)','unit':'pct',
    'avg':[a+b for a,b in zip(intang['avg'],otros['avg'])],
    'comp':{k:[a+b for a,b in zip(intang['comp'][k],otros['comp'][k])] for k in intang['comp']},'agg':True})
compvals = {}
for lab,k,short in M:
    v = comp[(lab,k)]
    compvals[short] = [x/100 for x in v] if not k else [None if x==0 else x for x in v]   # balance viene en 5.13 = 5.13%; KPI en 0 = dato faltante
D['reduced'] = [m[2] for m in M]
D['comps'] = {'names':['A','B','C','D'],'colors':{'A':'#4a3aa7','B':'#e87ba4','C':'#008300','D':'#e34948'},'items':compvals}
json.dump(D, open('data/data.json','w',encoding='utf-8'), ensure_ascii=False)
print('data/data.json OK —', len(D['reduced']), 'partidas reducidas')
