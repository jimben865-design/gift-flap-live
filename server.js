const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000,clients=new Set(),root=__dirname;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
function sendEvent(data){const msg='data: '+JSON.stringify(data)+'\n\n';for(const res of clients)res.write(msg)}
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&url.pathname==='/api/events'){
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','Access-Control-Allow-Origin':'*'});res.write(': connected\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;
  }
  if(req.method==='POST'&&url.pathname==='/api/event'){
    let body='';req.on('data',d=>body+=d);req.on('end',()=>{try{const event=JSON.parse(body||'{}');if(!['jump','addWin','subtractWin','start','resetRound'].includes(event.type))throw Error('Invalid event type');sendEvent(event);res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify({ok:true,event}))}catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:e.message}))}});return;
  }
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end();return}
  const rel=url.pathname==='/'?'index.html':url.pathname.slice(1),file=path.join(root,rel);
  if(!file.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found')}else{res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)}})
}).listen(PORT,()=>console.log('Gift Flap running at http://localhost:'+PORT));