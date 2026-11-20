import json,re
p='/home/claude/pirate-game/src/town/tortugaPainted.generated.ts'; s=open(p).read()
m=json.load(open('./mapout.json'))
s=re.sub(r"const B: number\[\] = \[.*?\];","const B: number[] = ["+",".join(f"{r['l']:g},{r['r']:g},{r['t']:g},{r['b']:g}" for r in m['blocks'])+"];",s,flags=re.S)
a=s.index("export const PAINTED_DOORS"); s=s[:a]+"export const PAINTED_DOORS: { id: string; x: number; y: number }[] = [\n"+"\n".join(f"  {{ id: '{d['id']}', x: {d['x']}, y: {d['y']} }}," for d in m['doors'])+"\n];\n"
open(p,'w').write(s)
