<template>
  <header>
    <p>
      <span>D·Jagger's Blog</span>
      <small class="signature">Keep it simple, stupid</small>
      <small><a href="/">HOME</a></small>
      <small><a href="mailto:634750802@qq.com">CONTACT</a></small>
    </p>
  </header>
</template>

<script>
  export default {
    name: 'Header'
  }
</script>

<style lang="less" scoped>
  header {
    font-family: "Seravek", serif;
    position: fixed;
    background: white;
    top: 0;
    left: 0;
    /*height: 80px;*/
    width: 100%;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    padding: 10px;
    box-sizing: border-box;
    z-index: 9999999;

    p {
      text-align: center;
      line-height: 60px;
      margin: 0 40px;
      font-size: 0;
      span {
        display: inline-block;
        font-size: 30px;
        vertical-align: middle;
      }
      small {
        display: inline-block;
        font-size: 17px;
        margin-left: 20px;
        margin-right: 20px;
        vertical-align: middle;

        &.signature {
          font-size: 12px;
        }
      }
    }
  }
</style>