import numpy as np, subprocess, sys, os, json
SRC, OUT = sys.argv[1], sys.argv[2]
SR=44100
# mode, max seconds, target rms dBFS
CFG={
 'pro_war_drums':('loop',0,-19),'pro_iron_string_D':('tex',34,-22),'pro_horn_Dm':('shot',0,-19),
 'a1_cello_low_D':('loop',0,-20),'a1_cello_micro_Dm':('loop',0,-20),'a1_cello_rough_D':('loop',0,-20),'a1_cello_prog_D':('loop',0,-20),
 'meadow_fiddle_Dm':('loop',0,-21),'meadow_lute_Am':('loop',0,-21),
 'fen_bow_Ebm':('tex',40,-23),'fen_chaser_Dm':('tex',32,-22),
 'ashes_duduk_Dm':('loop',0,-21),'ashes_duduk_riff_Dm':('loop',0,-21),'ashes_wind':('tex',16,-24),
 'pass_shaman_drum':('loop',0,-21),'pass_fiddle_snow_Dm':('loop',0,-21),'pass_bells_Dm':('tex',36,-23),
 'fort_war_bell_drums':('loop',0,-19),'fort_war_horn_E':('shot',0,-18),
 'a1boss_war_155':('loop',0,-18),'a1boss_strings_Dm':('loop',0,-20),'a1boss_frame_drum':('loop',0,-19),
 'villages_musicbox_Cm':('loop',0,-21),'villages_fiddle_Dm':('loop',0,-21),
 'slums_industrial':('loop',0,-22),'slums_menace':('tex',40,-23),
 'oldcity_tortured_A':('tex',40,-23),'oldcity_bells_Dm':('shot',0,-21),'oldcity_organ_Fsm':('loop',0,-21),
 'royal_harp_Cm':('loop',0,-21),'royal_strings_D':('loop',0,-20),'royal_bow_Bb':('tex',40,-23),
 'bridge_bass_A':('tex',40,-22),'bridge_braaam':('shot',0,-16),'bridge_chaser_E':('tex',40,-22),
 'a2boss_drums':('loop',0,-18),'a2boss_stabs_Fm':('loop',0,-19),'a2boss_predator':('loop',0,-18),
}
info={}
for n,(mode,mx,tgt) in CFG.items():
  raw=subprocess.run(['ffmpeg','-v','error','-i',f'{SRC}/{n}.wav','-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True).stdout
  a=np.frombuffer(raw,dtype=np.float32).reshape(-1,2).astype(np.float64)
  if mode=='tex':
    X=int(3*SR); L=min(len(a), int(mx*SR)+X) if mx else len(a)
    a=a[:L]; head=a[:X]; body=a[X:].copy(); t=np.linspace(0,1,X)[:,None]
    eq_in=np.sqrt(t); eq_out=np.sqrt(1-t)
    body[-X:]=body[-X:]*eq_out+head*eq_in
    a=body
  elif mode=='shot':
    # trim trailing silence, fade out last 0.4s
    e=np.abs(a).max(1); idx=np.where(e>1e-3)[0]; end=idx[-1]+1 if len(idx) else len(a); a=a[:end]
    f=min(int(.4*SR),len(a)); a[-f:]*=np.linspace(1,0,f)[:,None]
  rms=np.sqrt((a**2).mean())+1e-9; g=10**(tgt/20)/rms; a*=g
  pk=np.abs(a).max()
  if pk>.89: a*= .89/pk
  info[n]={'mode':mode,'dur':round(len(a)/SR,3),'gain_db':round(20*np.log10(g),1),'peak':round(float(np.abs(a).max()),3)}
  p=subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','libvorbis','-q:a','2',f'{OUT}/mx_{n}.ogg'],input=a.astype(np.float32).tobytes(),check=True)
json.dump(info,open(f'{OUT}/../mx_info.json','w'),indent=1)
print(json.dumps(info))
