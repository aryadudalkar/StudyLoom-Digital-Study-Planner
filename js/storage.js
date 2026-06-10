const Storage = {
  key: 'studyloom:v1',
  load(){
    try{
      const raw = localStorage.getItem(this.key);
      return raw? JSON.parse(raw): {user:null,tasks:[],subjects:[],notes:[],events:[],meta:{streak:0}};
    }catch(e){return {user:null,tasks:[],subjects:[],notes:[],events:[],meta:{streak:0}}}
  },
  save(state){
    localStorage.setItem(this.key, JSON.stringify(state));
  }
};

function withState(fn){
  const state = Storage.load();
  fn(state);
  Storage.save(state);
}
