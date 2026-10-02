"""Paso 3: inyecta data/data.json en tools/site_template.html -> index.html"""
import json
t = open('tools/site_template.html', encoding='utf-8').read().replace('__DATA__', json.dumps(json.load(open('data/data.json',encoding='utf-8')), ensure_ascii=False))
open('index.html','w',encoding='utf-8').write(t); print('index.html OK', len(t), 'bytes')
