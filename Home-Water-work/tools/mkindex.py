# Build index.html (for GitHub Pages) from page.html (the published artifact page).
# usage: python3 mkindex.py SITE_DIR
import sys
site=sys.argv[1]; page=open(f'{site}/page.html',encoding='utf8').read()
k0=page.index('<header class="topbar">')
full='<!doctype html>\n<html lang="th">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+page[:k0]+'\n</head>\n<body>\n'+page[k0:]+'\n</body>\n</html>\n'
open(f'{site}/index.html','w',encoding='utf8').write(full); open(f'{site}/.nojekyll','w').close(); print('index.html',len(full)//1024,'KB')
