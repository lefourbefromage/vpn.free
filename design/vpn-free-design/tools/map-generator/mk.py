import math, json, sys
import numpy as np
from matplotlib.path import Path
sys.path.insert(0, sys.argv[1]); from land import LAND, HOLES
OUT=sys.argv[2]
lp=[Path(p) for p in LAND]; hp=[Path(p) for p in HOLES]
def my(lat): return math.log(math.tan(math.radians(45+lat/2)))
def ilat(y): return math.degrees(2*math.atan(math.exp(y)))-90
CITIES={"you":(43.30,5.37),"paris":(48.86,2.35),"frankfurt":(50.11,8.68),"amsterdam":(52.37,4.90),"london":(51.51,-0.13),"madrid":(40.42,-3.70),"newyork":(40.71,-74.0),"toronto":(43.65,-79.38),"saopaulo":(-23.55,-46.63)}
VIEWS={
 "d-eu":dict(W=1360,H=720,lon0=-30,lon1=38,clat=48.2,sp=11,r=1.9),
 "d-atl":dict(W=1360,H=720,lon0=-97,lon1=21,clat=50.5,sp=11,r=1.9),
 "m-eu":dict(W=390,H=380,lon0=-12,lon1=22,clat=47,sp=8,r=1.35),
 "m-atl":dict(W=390,H=380,lon0=-84,lon1=12,clat=49,sp=8,r=1.35),
}
pos={}
for name,v in VIEWS.items():
  W,H=v["W"],v["H"]; k=W/(v["lon1"]-v["lon0"]); R=k*180/math.pi; yc=my(v["clat"])
  def proj(lat,lon): return ((lon-v["lon0"])*k, H/2-(my(lat)-yc)*R)
  sp=v["sp"]; xs=np.arange(sp/2,W,sp); ys=np.arange(sp/2,H,sp)
  pts=[];ll=[]
  for y in ys:
    lat=ilat(yc+(H/2-y)/R)
    for x in xs:
      pts.append((x,y)); ll.append((v["lon0"]+x/k,lat))
  ll=np.array(ll); land=np.zeros(len(ll),bool)
  for p in lp: land|=p.contains_points(ll)
  for p in hp: land&=~p.contains_points(ll)
  circ=[]
  for (x,y),l in zip(pts,land):
    if not l: continue
    dx=(x-W/2)/(W/2); dy=(y-H/2)/(H/2); d=math.sqrt(dx*dx*0.85+dy*dy)
    o=max(0,min(1,(1.12-d)/0.45))
    if o<=0.02: continue
    o=round(0.16+0.42*o,2) if o>0 else 0
    circ.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{v["r"]}" fill-opacity="{o}"/>')
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><g fill="#A28FFF">'+"".join(circ)+'</g></svg>'
  open(f"{OUT}/map-{name}.svg","w").write(svg)
  pos[name]={c:[round(a) for a in proj(*ll_)] for c,ll_ in CITIES.items()}
  print(name,len(circ),pos[name])
