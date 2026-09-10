/* Fictional planning model. No Alpine, Mindbody or booking API is connected. */
(function(root,factory){if(typeof module==='object'&&module.exports){module.exports=factory();}else{root.AlpinePlannerModel=factory();}})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const STORAGE_KEY='alpine-fitness-visit-planner-v1';
  const SAVED_KEY='alpine-fitness-saved-visit-v1';
  const BUFFER=15;
  const sessions=[
    {id:'morning-strength',name:'Small-group strength',type:'strength',start:390,duration:45,label:'A focused start to the day',tag:'STRENGTH · SAMPLE SESSION'},
    {id:'morning-mobility',name:'Movement & mobility',type:'mobility',start:540,duration:45,label:'Room to move at your own pace',tag:'MOBILITY · SAMPLE SESSION'},
    {id:'midday-strength',name:'Midday strength',type:'strength',start:735,duration:45,label:'A session in the middle of your day',tag:'STRENGTH · SAMPLE SESSION'},
    {id:'evening-strength',name:'Evening small group',type:'strength',start:1080,duration:45,label:'Close the workday with movement',tag:'STRENGTH · SAMPLE SESSION'}
  ];
  const recoveries=[
    {id:'spa',name:'Recovery spa visit',duration:30,description:'A little room to reset.',icon:'≈'},
    {id:'massage',name:'Massage appointment',duration:45,description:'Time set aside for yourself.',icon:'✳'}
  ];
  function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;}
  function dateString(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function defaultDate(){const d=new Date();d.setDate(d.getDate()+1);return dateString(d);}
  function shiftDate(value,days){const d=new Date(value+'T12:00:00');d.setDate(d.getDate()+days);return dateString(d);}
  function sessionById(id){return sessions.find(item=>item.id===id)||null;}
  function recoveryById(id){return recoveries.find(item=>item.id===id)||null;}
  function availableStarts(session,recovery){if(!session||!recovery)return [];const result=[];for(let min=480;min+recovery.duration<=1200;min+=30){if(min>=session.start+session.duration+BUFFER)result.push(min);}return result;}
  function sanitize(raw){const state={date:defaultDate(),sessionId:null,recoveryId:null,recoveryStart:null};if(!raw||typeof raw!=='object')return state;if(validDate(raw.date))state.date=raw.date;const session=sessionById(raw.sessionId);if(session)state.sessionId=session.id;const recovery=recoveryById(raw.recoveryId);if(recovery)state.recoveryId=recovery.id;if(Number.isInteger(raw.recoveryStart)&&availableStarts(session,recovery).includes(raw.recoveryStart))state.recoveryStart=raw.recoveryStart;return state;}
  function formatTime(minutes,includePeriod=true){const hour=Math.floor(minutes/60),minute=minutes%60;return `${hour%12||12}:${String(minute).padStart(2,'0')}${includePeriod?' '+(hour>=12?'PM':'AM'):''}`;}
  function formatDate(value){return new Date(value+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});}
  function eventsFor(raw){const state=sanitize(raw),session=sessionById(state.sessionId),recovery=recoveryById(state.recoveryId);if(!session)return [];const result=[{id:session.id,name:session.name,start:session.start,duration:session.duration}];if(recovery&&state.recoveryStart!==null)result.push({id:recovery.id,name:recovery.name,start:state.recoveryStart,duration:recovery.duration});return result;}
  function planValid(raw){const state=sanitize(raw);return Boolean(state.sessionId&&(!state.recoveryId||state.recoveryStart!==null));}
  function icsEscape(value){return String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
  function icsDate(date,minutes){return date.replaceAll('-','')+'T'+String(Math.floor(minutes/60)).padStart(2,'0')+String(minutes%60).padStart(2,'0')+'00';}
  function calendar(raw,now=new Date()){if(!planValid(raw))throw new Error('Choose a training session and a valid recovery time before exporting.');const state=sanitize(raw),stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Rapid Studios//Alpine Independent Concept//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Alpine sample visit - unconfirmed','BEGIN:VTIMEZONE','TZID:America/Denver','BEGIN:DAYLIGHT','DTSTART:20070311T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU','TZOFFSETFROM:-0700','TZOFFSETTO:-0600','TZNAME:MDT','END:DAYLIGHT','BEGIN:STANDARD','DTSTART:20071104T020000','RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU','TZOFFSETFROM:-0600','TZOFFSETTO:-0700','TZNAME:MST','END:STANDARD','END:VTIMEZONE'];eventsFor(state).forEach(event=>{lines.push('BEGIN:VEVENT',`UID:alpine-concept-${state.date}-${event.id}@rapidstudios.local`,`DTSTAMP:${stamp}`,`DTSTART;TZID=America/Denver:${icsDate(state.date,event.start)}`,`DTEND;TZID=America/Denver:${icsDate(state.date,event.start+event.duration)}`,`SUMMARY:${icsEscape('SAMPLE PLAN - '+event.name)}`,'DESCRIPTION:Independent concept. Fictional schedule. No reservation made.',`LOCATION:${icsEscape('Alpine Fitness concept - not a confirmed appointment')}`,'STATUS:TENTATIVE','TRANSP:TRANSPARENT','END:VEVENT');});lines.push('END:VCALENDAR');return lines.join('\r\n')+'\r\n';}
  return {STORAGE_KEY,SAVED_KEY,BUFFER,sessions,recoveries,validDate,defaultDate,shiftDate,sessionById,recoveryById,availableStarts,sanitize,formatTime,formatDate,eventsFor,planValid,calendar};
});
