<template>
  <div id="app" :style="style">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  data(){
    return{
      style:""
    }
     
  },
  components: {
    // layers
  },
  mounted(){
    window.onresize=()=>{
       let height=document.documentElement.clientHeight;
       this.style=`height:${height}px`
    }
    window.onload=()=>{
      let height=document.documentElement.clientHeight;
      this.style=`height:${height}px`;
    }
  }
}
</script>

<style>
#app {
  /* height: 100%; */
  width: 100%;
  /* position: relative; */
}
body{
  margin: 0px;
  padding: 0px;
}

</style>
