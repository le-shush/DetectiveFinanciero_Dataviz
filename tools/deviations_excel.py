"""Opcional: Excel con desviaciones % empresa vs industria y la industria más parecida (misma lógica que la vista "Empresas vs industrias")."""
import openpyxl, statistics
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.formatting.rule import ColorScaleRule

import sys
SRC=sys.argv[1] if len(sys.argv)>1 else 'data/20261001_Detective_Financiero_v3.xlsx'
OUT='assets/Detective_Desviaciones_vs_Industria.xlsx'
wb=openpyxl.load_workbook(SRC,data_only=True); ws=wb['Resumen']
rows=list(ws.iter_rows(values_only=True))

# --- company data (cols B..F) ---
comp_names=['A','B','C','D']
comp={}   # label -> [A,B,C,D]
kpi_mode=False
for r in rows:
    lab=r[1]
    if lab=='Indicadores Seleccionados': kpi_mode=True; continue
    if lab and all(isinstance(v,(int,float)) for v in r[2:6]):
        comp[(lab,kpi_mode)]=list(r[2:6])
# --- industry averages (cols H..L) ---
inds=['O&G','Biotech','Tech','Pharma']
avg={}; seen={}
for r in rows:
    lab=r[7]
    if lab and all(isinstance(v,(int,float)) for v in r[8:12]):
        lab=lab.strip(); seen[lab]=seen.get(lab,0)+1
        avg[(lab,seen[lab])]=list(r[8:12])
A=lambda l,n=1: avg[(l,n)]

# mapping: (company label, is_kpi) -> (avg label, occurrence, scale company by 1/100?, display name, unit)
MAP=[
 ('Efectivo',False,'Cash & Cash Equivalents',1,True,'Efectivo / Activos','pct'),
 ('Inversiones temporales',False,'Short-Term Investments - Total',1,True,'Inversiones temporales / Activos','pct'),
 ('Cuentas por cobrar',False,'Trade Accounts & Trade Notes Receivable - Net',1,True,'Cuentas por cobrar / Activos','pct'),
 ('Inventarios',False,'Inventories - Total',1,True,'Inventarios / Activos','pct'),
 ('Otros activos corrientes',False,'Other Current Assets',1,True,'Otros activos corrientes / Activos','pct'),
 ('Total Activo Corriente/Total Activos',False,'Total Current Assets',1,True,'Total activo corriente / Activos','pct'),
 ('PPE neto/Total Activos',False,'Property, Plant & Equipment - Net - Total',1,True,'PP&E neto / Activos','pct'),
 ('Inversiones a largo plazo/Total Activos',False,'Investments - Long-Term',1,True,'Inversiones LP / Activos','pct'),
 ('Otros Activos a largo Plazo',False,'__OTROS_LP__',1,True,'Otros activos LP (intangibles + otros) / Activos','pct'),
 ('Total Activo No Corriente/Total Activos',False,'Total Non-Current Assets',1,True,'Total activo no corriente / Activos','pct'),
 ('Cuentas por pagar/Total Activo',False,'Trade Accounts & Trade Notes Payable - Short-Term',1,True,'Cuentas por pagar / Activos','pct'),
 ('Obligaciones financieras CP/Total Activo',False,'Short-Term Debt & Current Portion of Long-Term Debt',1,True,'Deuda CP / Activos','pct'),
 ('Otros pasivos corto plazo/Total Activo',False,'Other Current Liabilities',1,True,'Otros pasivos CP / Activos','pct'),
 ('Pasivo corriente/Total Activo',False,'Total Current Liabilities',1,True,'Pasivo corriente / Activos','pct'),
 ('Obligaciones financieras LP/Total Activo',False,'Debt - Long-Term - Total',1,True,'Deuda LP / Activos','pct'),
 ('Otros pasivos LP/Total Activo',False,'Other Non-Current Liabilities',1,True,'Otros pasivos LP / Activos','pct'),
 ('Pasivo No corriente/Total Activo',False,'Total Non-Current Liabilities',1,True,'Pasivo no corriente / Activos','pct'),
 ('Total pasivo/Total Activo',False,'Total Liabilities',1,True,'Total pasivo / Activos','pct'),
 ('Capital suscrito/Total Activo',False,'Common Equity - Total',1,True,'Capital común / Activos','pct'),
 ('Total patrimonio/Total Activo',False,"Total Shareholders' Equity",1,True,'Total patrimonio / Activos','pct'),
 ('ROE',True,'ROE',1,False,'ROE','pct'),
 ('Margen operacional',True,'Margen operacional (OM)',1,False,'Margen operacional','pct'),
 ('Prueba Acida',True,'Prueba ácida (QR)',1,False,'Prueba ácida','x'),
 ('Razon corriente',True,'Razón corriente (CR)',1,False,'Razón corriente','x'),
 ('Días de inventario',True,'Días promedio de inventario (DIO)',1,False,'Días de inventario','d'),
 ('Días de cuentas por cobrar',True,'Días promedio de cartera (DSO)',1,False,'Días de cuentas por cobrar','d'),
 ('Rotación de activos totales',True,'Rotación de activos totales (ATR)',1,False,'Rotación de activos totales','x'),
 ('Rotación de activos fijos netos',True,'Rotación de activos fijos netos (FAT)',1,False,'Rotación de activos fijos netos','x'),
]
BAL_N=20
items=[]
for cl,k,al,occ,scale,name,unit in MAP:
    cv=comp[(cl,k)]; cv=[v/100 for v in cv] if scale else cv
    av=[x+y for x,y in zip(A('Intangible Assets - Total - Net'),A('Other Non-Current Assets'))] if al=='__OTROS_LP__' else A(al,occ)
    items.append(dict(name=name,unit=unit,kpi=k,comp=cv,avg=av))

def dev(c,a):
    if a==0: return None
    return (c-a)/abs(a)

# per company: deviations matrix, closest industry per item, scores
res={}
for ci,cn in enumerate(comp_names):
    D=[]; closest=[]
    for it in items:
        c=it['comp'][ci]
        if it['kpi'] and c==0: D.append([None]*4); closest.append(None); continue   # 0 en KPI = dato faltante
        d=[dev(c,a) for a in it['avg']]
        D.append(d)
        valid=[(abs(x),j) for j,x in enumerate(d) if x is not None]
        closest.append(min(valid)[1] if valid else None)
    wins=[sum(1 for x in closest if x==j) for j in range(4)]
    med=[statistics.median([abs(D[i][j]) for i in range(len(items)) if D[i][j] is not None]) for j in range(4)]
    # balance-only pp distance (mean abs diff in percentage points)
    pp=[statistics.mean([abs(items[i]['comp'][ci]-items[i]['avg'][j]) for i in range(BAL_N)]) for j in range(4)]
    best=max(range(4),key=lambda j:(wins[j],-med[j]))
    res[cn]=dict(D=D,closest=closest,wins=wins,med=med,pp=pp,best=best)
    print(cn,'wins',wins,'median|dev|',[round(m,2) for m in med],'pp',[round(p*100,1) for p in pp],'->',inds[best])

# ---------------- write Excel ----------------
COL={'O&G':'2A78D6','Biotech':'EB6834','Tech':'1BAF7A','Pharma':'EDA100'}
LIGHT={'O&G':'DCEAFB','Biotech':'FDE4D9','Tech':'D6F3E8','Pharma':'FFF1CC'}
wbo=openpyxl.Workbook(); S=wbo.active; S.title='Resumen desviaciones'
thin=Side(style='thin',color='D1D5DB'); B=Border(top=thin,bottom=thin,left=thin,right=thin)
H=PatternFill('solid',fgColor='1F2937'); HF=Font(bold=True,color='FFFFFF'); C=Alignment(horizontal='center',vertical='center',wrap_text=True)
def hdr(ws,r,vals,fills=None):
    for j,v in enumerate(vals):
        c=ws.cell(r,1+j,v); c.fill=H; c.font=HF; c.alignment=C; c.border=B
        if fills and fills[j]: c.fill=PatternFill('solid',fgColor=fills[j])

S['A1']='Detective financiero — ¿a qué industria se parece cada empresa?'; S['A1'].font=Font(bold=True,size=14)
S['A2']='Desviación % = (valor empresa − promedio industria) / |promedio industria|. Se compararon 20 partidas de balance (% del activo) y 8 indicadores. El color marca la industria más parecida.'
S['A2'].font=Font(color='52514E')
r=4
hdr(S,r,['Empresa','Industria más parecida','# partidas donde es la más cercana (de 28)','Mediana |desviación %|','Distancia balance (p.p. promedio)','Detalle por industria →']+[f'{i}: # cercanas / mediana |desv|' for i in inds],
    [None]*6+[COL[i] for i in inds])
S.row_dimensions[r].height=48
for ci,cn in enumerate(comp_names):
    r+=1; R=res[cn]; b=R['best']; ind=inds[b]
    vals=[f'Empresa {cn}',ind,R['wins'][b],R['med'][b],R['pp'][b],'']+[f"{R['wins'][j]} / {R['med'][j]:.0%}" for j in range(4)]
    for j,v in enumerate(vals):
        c=S.cell(r,1+j,v); c.border=B; c.alignment=Alignment(horizontal='center')
    S.cell(r,1).font=Font(bold=True); S.cell(r,1).fill=PatternFill('solid',fgColor=COL[ind]); S.cell(r,1).font=Font(bold=True,color='FFFFFF')
    S.cell(r,2).fill=PatternFill('solid',fgColor=COL[ind]); S.cell(r,2).font=Font(bold=True,color='FFFFFF')
    S.cell(r,4).number_format='0%'; S.cell(r,5).number_format='0.0%'
    S.cell(r,7+b).fill=PatternFill('solid',fgColor=LIGHT[ind]); S.cell(r,7+b).font=Font(bold=True)
for i,w in enumerate([14,20,22,18,20,4,22,22,22,22],1): S.column_dimensions[get_column_letter(i)].width=w

# Big table: items x (A..D) deviations against each industry
r+=3
S.cell(r,1,'Tabla de desviaciones % por partida (vs. promedio de cada industria)').font=Font(bold=True,size=12); r+=1
S.cell(r,1,'Verde = se parece (|desv| ≤ 25%), amarillo = medio, rojo = muy distinto (≥ 100%). "—" = dato en cero / no comparable.').font=Font(color='52514E'); r+=1
# header rows: company group then industries
top=r
S.cell(r,1,'Partida'); S.cell(r,2,'Unidad')
col=3
for ci,cn in enumerate(comp_names):
    ind=inds[res[cn]['best']]
    S.cell(r,col,f'Empresa {cn} · valor');
    S.merge_cells(start_row=r,start_column=col+1,end_row=r,end_column=col+4)
    S.cell(r,col+1,f'Empresa {cn} → parece {ind}')
    for k in range(5):
        c=S.cell(r,col+k); c.fill=PatternFill('solid',fgColor=COL[ind]); c.font=HF; c.alignment=C; c.border=B
    col+=6
S.cell(r,1).fill=H; S.cell(r,1).font=HF; S.cell(r,2).fill=H; S.cell(r,2).font=HF
r+=1
S.cell(r,1,''); S.cell(r,2,'')
col=3
for ci,cn in enumerate(comp_names):
    S.cell(r,col,'Valor'); S.cell(r,col).fill=H; S.cell(r,col).font=HF; S.cell(r,col).alignment=C
    for j,ind in enumerate(inds):
        c=S.cell(r,col+1+j,f'vs {ind}'); c.fill=PatternFill('solid',fgColor=COL[ind]); c.font=HF; c.alignment=C; c.border=B
    col+=6
for k in (1,2): S.cell(r,k).fill=H
r+=1; first=r
def fmtv(v,u): return '0.0%' if u=='pct' else ('0.0' if u=='d' else '0.00')
for i,it in enumerate(items):
    if i==0: S.cell(r,1,'BALANCE (% del total de activos)').font=Font(bold=True); S.cell(r,1).fill=PatternFill('solid',fgColor='E5E7EB'); r+=1
    if i==BAL_N: S.cell(r,1,'INDICADORES').font=Font(bold=True); S.cell(r,1).fill=PatternFill('solid',fgColor='E5E7EB'); r+=1
    S.cell(r,1,it['name']).border=B; S.cell(r,2,{'pct':'%','x':'veces','d':'días'}[it['unit']]).border=B
    col=3
    for ci,cn in enumerate(comp_names):
        c=S.cell(r,col,it['comp'][ci]); c.number_format=fmtv(None,it['unit']); c.border=B; c.font=Font(bold=True)
        for j in range(4):
            d=res[cn]['D'][i][j]
            c=S.cell(r,col+1+j,'—' if d is None else d); c.border=B; c.alignment=Alignment(horizontal='center')
            if d is not None:
                c.number_format='+0%;-0%;0%'
                if j==res[cn]['closest'][i]: c.font=Font(bold=True)
        col+=6
    r+=1
last=r-1
# color scale on deviation cells (abs via rule on absolute? use 3-color on value with symmetric bounds)
col=3
for ci in range(4):
    rng=f'{get_column_letter(col+1)}{first}:{get_column_letter(col+4)}{last}'
    S.conditional_formatting.add(rng,ColorScaleRule(start_type='num',start_value=-1,start_color='F8B4B4',mid_type='num',mid_value=0,mid_color='BBF7D0',end_type='num',end_value=1,end_color='F8B4B4'))
    col+=6
# industry averages reference block
r+=2; S.cell(r,1,'Promedios de industria usados (de la hoja Resumen)').font=Font(bold=True,size=12); r+=1
hdr(S,r,['Partida','Unidad']+inds,[None,None]+[COL[i] for i in inds]); r+=1
for it in items:
    S.cell(r,1,it['name']).border=B; S.cell(r,2,{'pct':'%','x':'veces','d':'días'}[it['unit']]).border=B
    for j in range(4):
        c=S.cell(r,3+j,it['avg'][j]); c.number_format=fmtv(None,it['unit']); c.border=B
    r+=1
S.column_dimensions['A'].width=36; S.column_dimensions['B'].width=8
for cidx in range(3,3+24): S.column_dimensions[get_column_letter(cidx)].width=12
S.freeze_panes=S.cell(first,3)
wbo.save(OUT); print('saved')
