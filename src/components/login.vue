<template>
  <div class="container">
    <el-form
      :model="form"
      status-form
      :rules="rules"
      ref="form"
      label-width="100px"
      class="login-container"
    >
      <h3 class="login-title">系统登录</h3>
      <el-form-item
        label="用户名"
        label-width="80px"
        prop="username"
        class="username"
      >
        <el-input
          type="input"
          v-model="form.username"
          auto-complete="off"
          placeholder="请输入账号"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="密码"
        label-width="80px"
        prop="password"
        class="password"
      >
        <el-input
          type="password"
          v-model="form.password"
          auto-complete="off"
          placeholder="请输入密码"
        ></el-input>
      </el-form-item>
      <el-form-item class="login-submit">
        <el-button type="primary" @click="login">登录</el-button>
      </el-form-item>
    </el-form>
    <router-view></router-view>
  </div>
</template>

<script>
import Cookie from 'js-cookie'
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "login",
  data() {
    return {
      form: {
        username: "",
        password: "",
      },

      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            message: "用户名长度不能小于3位",
            trigger: "blur",
          },
        ],

        password: [{ required: true, message: "请输入密码", trigger: blur }],
      },
    };
  },
  created(){
    if(Cookie.get('username')&&Cookie.get('password')){
       this.form.username=Cookie.get('username')
       this.form.password=Cookie.get('password')
    }
  },
  methods: {
    login() {
      let { username, password } = this.form;
      this.$axios({
        method: "post",
        url: "/user",
        data: {
          username,
          password
        },
      }).then((res) => {
        console.log(res);
        let code = res.data.meta.status;
        if (code == "200") {
        //   this.$store.commit("router", this.$router);
        console.log("router", this.$router)
        Cookie.set('username', username)
        Cookie.set('password', password)
        sessionStorage.setItem('isSignIn', 'true')
        //   this.$store.commit("addMenu", this.$router);
          this.$router.push({name:"layers"});
        }else{
          this.$message.error('登录失败，请检测密码或账号是否正确');
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.container {
  width: 100vw;
  height: 100vh;
  .login-container {
    border-radius: 15px;
    background-clip: padding-box;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    padding: 35px 35px 15px 35px;
    background-color: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
  }

  .login-title {
    margin: 0 auto 40px auto;
    text-align: center;
    color: #505458;
  }

  .login-submit {
    display: flex;
    justify-content: center;
    margin-right: 100px;
  }
}
</style>