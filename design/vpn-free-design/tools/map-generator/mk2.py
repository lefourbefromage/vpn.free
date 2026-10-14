import math, sys, json
import numpy as np
from matplotlib.path import Path
sys.path.insert(0,'gen'); from land import LAND, HOLES
lp=[Path(p) for p in LAND]; hp=[Path(p) for p in HOLES]
def my(lat): return math.log(math.tan(math.radians(45+lat/2)))
def ilat(y): return math.degrees(2*math.atan(math.exp(y)))-90
C={"you":(43.30,5.37),"paris":(48.86,2.35),"frankfurt":(50.11,8.68),"amsterdam":(52.37,4.90),"london":(51.51,-0.13),"madrid":(40.42,-3.70),"newyork":(40.71,-74.0),"toronto":(43.65,-79.38)}
V={
"d-eu":dict(Wo=1360,Ho=720,Ws=1900,lon0=-38,k=22,f=1800,th=40,Hb=710,ty=470,sp=11,r=2.1,edge=230,cv=150),
"d-atl":dict(Wo=1360,Ho=720,Ws=1900,lon0=-108,k=13.2,f=1800,th=40,Hb=710,ty=470,sp=11,r=2.1,edge=230,cv=150),
"m-eu":dict(Wo=390,Ho=380,Ws=560,lon0=-16.5,k=13,f=800,th=40,Hb=372,ty=255,sp=8,r=1.5,edge=48,cv=50),
"m-atl":dict(Wo=390,Ho=380,Ws=560,lon0=-102,k=4.5,f=800,th=40,Hb=372,ty=235,sp=8,r=1.5,edge=48,cv=50),
}
out={}
for n,v in V.items():
  th=math.radians(v["th"]); R=v["k"]*180/math.pi; f=v["f"]
  def proj_dv(u,dv):
    z=-dv*math.sin(th); s=f/(f+z)
    x=v["Wo"]/2+(u-v["Ws"]/2)*s; nx=(x-v["Wo"]/2)/(v["Wo"]/2)
    return x, v["Hb"]+dv*math.cos(th)*s+v["cv"]*nx*nx, s
  # solve bottom y such that you projects to ty
  lo,hi=-1.0,1.5
  for _ in range(60):
    yb=(lo+hi)/2; dv=-(my(C["you"][0])-yb)*R
    if proj_dv((C["you"][1]-v["lon0"])*v["k"],dv)[1] < v["ty"]: hi=yb
    else: lo=yb
  # Note: yb lower -> you further up. adjust direction
  yb=(lo+hi)/2
  dv=-(my(C["you"][0])-yb)*R
  if abs(proj_dv((C["you"][1]-v["lon0"])*v["k"],dv)[1]-v["ty"])>2:
    lo,hi=-1.0,1.5
    for _ in range(60):
      yb=(lo+hi)/2; dv=-(my(C["you"][0])-yb)*R
      if proj_dv((C["you"][1]-v["lon0"])*v["k"],dv)[1] > v["ty"]: hi=yb
      else: lo=yb
    yb=(lo+hi)/2
  def P(lat,lon):
    u=(lon-v["lon0"])*v["k"]; dv=-(my(lat)-yb)*R
    x,y,s=proj_dv(u,dv); return round(x),round(y)
  # source rows until projected top < -10, bottom extends a bit below
  pts=[];circ=[]
  dvs=np.arange(v["sp"]*3, -4000, -v["sp"])
  us=np.arange(v["sp"]/2, v["Ws"], v["sp"])
  for dv in dvs:
    lat=ilat(yb - dv/R)
    if lat>86: break
    x0,y0,s=proj_dv(v["Ws"]/2,dv)
    if y0 < -40: break
    if y0 > v["Ho"]+10: continue
    lls=np.array([[v["lon0"]+u/v["k"], lat] for u in us])
    land=np.zeros(len(lls),bool)
    for p in lp: land|=p.contains_points(lls)
    for p in hp: land&=~p.contains_points(lls)
    for u,l in zip(us,land):
      if not l: continue
      x,y,s=proj_dv(u,dv)
      if x< -5 or x>v["Wo"]+5: continue
      e=v["edge"]
      fx=min(1,max(0,min(x,v["Wo"]-x)/e)); yp=y-v["cv"]*((x-v["Wo"]/2)/(v["Wo"]/2))**2; ft=min(1,max(0,yp/(e*1.2))); fb=min(1,max(0,(v["Ho"]-y)/(e*0.6)))
      dx=(x-v["Wo"]/2)/(v["Wo"]/2); dy=(yp-v["Ho"]*0.55)/(v["Ho"]*0.62)
      d=math.sqrt(dx*dx+dy*dy); rr=min(1,max(0,(1.08-d)/0.38))
      o=fx*ft*fb*rr; o=o*o*(3-2*o)
      if o<0.04: continue
      op=round(o*(0.22+0.42*s),2)
      circ.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{v["r"]*s:.2f}" fill-opacity="{op}"/>')
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{v["Wo"]}" height="{v["Ho"]}" viewBox="0 0 {v["Wo"]} {v["Ho"]}"><g fill="#A28FFF">'+"".join(circ)+'</g></svg>'
  open(f"assets/g-{n}.svg","w").write(svg)
  out[n]={c:P(*ll) for c,ll in C.items()}
  print(n,len(circ),out[n])
