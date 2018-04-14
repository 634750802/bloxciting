<template>
  <header>
    <p>D·Jagger's Blog <small>Keep it simple, stupid</small> <small><a href="/">HOME</a></small> <small><a href="mailto:634750802@qq.com">CONTACT</a></small></p>
  </header>
</template>

<script>
  export default {
    name: 'Header'
  }
</script>

<style lang="less" scoped>
  header {
    font-family: "Savoye LET",serif;
    position: fixed;
    background: white;
    top: 0;
    left: 0;
    height: 80px;
    width: 100%;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    padding: 10px;
    box-sizing: border-box;

    p {
      font-size: 30px;
      line-height: 60px;
      margin: 0 0 0 40px;
      small {
        margin-left: 40px;
        font-size: 17px;
      }
    }
  }
</style>