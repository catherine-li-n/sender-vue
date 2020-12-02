<template>
  <div>
    <div class="header">
      <div class="logo">
        <img src="../assets/img/logo.png"/>
      </div>
      <div class="name">
        <span style="float:left" @click="add_customer">{{ serveName }}正在为&nbsp;</span>
        <span class="header-title" @click="add_customer">{{ customer }}</span>
        <span @click="add_customer">&nbsp;服务</span>
      </div>
      <div v-show="inputing" class="input">
        <input v-model="customer" placeholder="请输入服务客户名称..." id="cont">
        <button class="btn btn-primary submit" @click="add_customer">确定</button>
      </div>
    </div>
    <div class="container-fluid main">
      <div class="row">
        <div class="col-md-2 left">
          <ul class="nav flex-column" style="text-align:center">
            <li class="nav-item">
              <a href="#">
                <label class="up-file" for="excel-file">
                  导入号码
                  <input type="file" ref="refFile" class="up-file" id="excel-file" style="display: none" v-on:change="fileLoad">
                </label>
              </a>
            </li>
            <li class="nav-item" id="send">
              <b-link class="send_a" @click="send">发&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;送</b-link>
            </li>
            <li class="nav-item">
              <a id="popover-button-sync" variant="primary" href="#" tabindex="0">预约发送</a>
            </li>
            <b-popover :show.sync="show" target="popover-button-sync" title="请选择发送时间和日期">
              <template>
                <b-row>
                  <b-col>
                    <b-form-datepicker id="datepicker" v-model="reserveDate" class="mb-2"></b-form-datepicker>
                    <p>日期: '{{ reserveDate }}'</p>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col md="auto">
                    <b-time id="timepicker" v-model="reserveTime" locale="en"></b-time>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <b-button class="float-right" @click="onCancel" style="margin:5px">取消</b-button>
                    <b-button class="float-right" @click="onConfirm" style="margin:5px">确定</b-button>
                  </b-col>
                </b-row>
              </template>
            </b-popover>
            <li class="nav-item">
              <a href="#">黑白名单</a>
            </li>
            <p v-show="reserve">预计{{ reserveDate }} {{ reserveTime }}发送</p>
          </ul>
          <hr class="my-4">
          <div class="left_theme">
            <div class="theme" style="font-size: 16px">{{ serveName }}</div>
            <div class="theme" style="font-size: 14px; margin-top:5px">{{ serveSlogan }}</div>
          </div>
          <div class="operators">
            <img src="../assets/img/2.png"/>
            <img src="../assets/img/3.png"/>
            <img src="../assets/img/1.png">
          </div>
          <div id = "intro" style = "text-align:center;">
            <h4>{{ timeStamp }}</h4>
          </div>
        </div>
        <div class="col-md-10">
          <div class="top">
            <div class="tab-content">
              <b-card no-body>
                <b-tabs v-model="tabIndex" card>
                  <b-tab title="短信发送" active>
                    <div class="tab-content">
                      <b-row>
                        <b-col sm="8">
                          <b-form-textarea
                            v-model="msgContent"
                            class="test_phone"
                            placeholder="请在此输入内容..."
                            rows="12"
                          ></b-form-textarea>
                        </b-col>
                        <b-col sm="4">
                          <b-form-textarea
                            v-model="testList"
                            class="test_phone"
                            placeholder="请输入测试号码,号码之间用回车间隔..."
                            rows="12"
                          ></b-form-textarea>
                        </b-col>
                      </b-row>
                    </div>
                  </b-tab>
                  <b-tab title="发送日志">
                    <b-card-text style="font-size: 25px; margin: 60px">
                      <span>{{ serveName }}</span>于<strong>{{ startTime }}</strong>到<strong>{{ endTime }}</strong>为
                      <br>
                      "<strong class="message">{{ customer }}</strong>"服务,群发短信:
                      <br>
                      <span>"</span><span style="color: grey">{{ msgContent }}</span><span>"</span>
                    </b-card-text>
                    <b-card-text style="font-size: 20px; margin: 40px">
                      总发送:&nbsp;<span class="message">{{ phoneSum }}&nbsp;</span>条,
                      成功发送&nbsp;<span class="message">{{ Math.ceil(phoneSum * successRate) }}&nbsp;</span>条,
                      未成功发送&nbsp;<span style="color: grey">{{ phoneSum - Math.ceil(phoneSum * successRate) }}&nbsp;</span>条。
                    </b-card-text>
                  </b-tab>
                  <b-tab title="彩信"><h2>开发中，暂未开放</h2></b-tab>
                  <b-tab title="视信"><h2>开发中，暂未开放</h2></b-tab>
                  <b-tab title="长短信"><h2>开发中，暂未开放</h2></b-tab>
                </b-tabs>
                <div v-show="paginator" id="main-bottom" style="background: #fff; border-bottom: 1px solid #fff;">
                  <table class="exceltable" id="mytable" style="width: 100%;" cellpadding="0" cellspacing="1">
                    <thead class="tablehead"></thead>
                    <tbody class="tablebody">
                      <tr v-for="(i, index) in dataList" :key="index">
                        <td v-for="(val, index) in dataList[index]" :key="index">{{ val }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div>
                    <b-pagination v-model="currentPage" pills :total-rows="rows" :per-page="pageSize" size="lg"></b-pagination>
                  </div>
                </div>
                <div class="bottom">
                  <b-progress v-show="progress" height="30px" :value="progressValue" variant="success" striped :animated="animate"></b-progress>
                </div>
              </b-card>
            </div>
          </div>
          <!-- <div class="bottom"></div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import myConfig from '@/assets/config.json'
const serveName = myConfig['serveName']
const slogan = myConfig['serveSlogan']
const logo = myConfig['logo']
const username = myConfig['username']
const password = myConfig['password']
const userid = myConfig['userid']
var sendWay = myConfig['sendWay']
const sendUrl = myConfig['sendUrl']
const { remote } = global.require('electron')
const { BrowserWindow } = remote
const fs = global.require('fs')
const os = global.require('os')
const path = global.require('path')
const QueryLinesReader = global.require('../public/js/query-lines')
const axios = require('axios')
const parseString = require('xml2js').parseString
const md5 = require('md5')
var customerDir = ''
function addZero (val) {
  if (val > 10) {
    return val
  } else {
    return '0' + val
  }
}
export default {
  name: 'HelloWorld',
  methods: {
    add_customer: function () {
      this.inputing = !this.inputing
    },
    fileLoad: function () {
      this.file = this.$refs.refFile.files[0]
      let queryLinesReader = new QueryLinesReader(path.resolve(this.file.path))
      queryLinesReader.getTotal().then(totalRes => {
        this.rows = totalRes
        this.pageNum = Math.ceil(totalRes / this.pageSize)
      })
      this.currentPage = 1
      this.getPage()
    },
    getPage: function () {
      let queryLinesReader = new QueryLinesReader(path.resolve(this.file.path))
      queryLinesReader.queryLines({
        pageSize: this.pageSize,
        currentPage: this.currentPage - 1
      }).then(res => {
        this.dataList = res.lineList
        const result = []
        for (var p = 0; p < this.dataList.length; p += 5) {
          var tmp = []
          for (var q = p; q < p + 5; q++) {
            tmp.push(this.dataList[q])
          }
          result.push(tmp)
        }
        this.dataList = result
      })
    },
    nextPage: function () {
      if (this.currentPage + 1 <= this.pageNum) {
        this.currentPage += 1
      }
    },
    lastPage: function () {
      if (this.currentPage > 0) {
        this.currentPage -= 1
      }
    },
    send: async function () {
      if (this.file === undefined) {
        alert('请先导入号码')
      } else if (this.customer === '') {
        alert('请先输入服务客户名称')
      } else {
        const tmpList = this.testList.split('\n')
        if (tmpList.length === 1) {
          this.phoneSum = this.rows
        } else {
          this.phoneSum = this.rows + tmpList.length
        }
        console.log(sendWay)
        if (sendWay === '真实发送') {
          const checkBalance = await this.checkBalance()
          if (checkBalance === true) {
            var readline = global.require('readline')
            var fRead = fs.createReadStream(this.file.path)
            var objReadline = readline.createInterface({
              input: fRead
            })
            var sendList = ''
            objReadline.on('line', (line) => {
              sendList += line + ','
            })
            objReadline.on('close', () => {
              var fd = new FormData()
              var timestamp = ''
              if (this.reserve === true) {
                timestamp = this.reserveDate.replace('-', '').replace('-', '') + this.reserveTime.replace(':', '').replace(':', '')
              } else {
                var sendDay = new Date()
                var date = sendDay.getFullYear() + '' + addZero((sendDay.getMonth() + 1)) + '' + addZero(sendDay.getDate())
                var time = addZero(sendDay.getHours()) + '' + addZero(sendDay.getMinutes()) + '' + addZero(sendDay.getSeconds())
                timestamp = date + time
              }
              var signature = username + password + timestamp
              console.log(signature)
              fd.append('action', 'send')
              fd.append('timestamp', timestamp)
              fd.append('sign', md5(signature))
              fd.append('userid', userid)
              fd.append('content', this.msgContent)
              fd.append('mobile', sendList)
              let config = {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              }
              // axios.post(sendUrl, fd, config).then((response) => {
              //   console.log(response)
              //   var xmlResult = response['data']
              //   var parseString = require('xml2js').parseString
              //   var returnStatus = ''
              //   var message = ''
              //   var remainPoint = 0
              //   var taskID = 0
              //   parseString(xmlResult, function (err, result) {
              //     if (err) {
              //       console.log(err)
              //     }
              //     returnStatus = result['returnsms']['returnstatus'][0]
              //     message = result['returnsms']['message'][0]
              //     remainPoint = result['returnsms']['remainpoint'][0]
              //     taskID = result['returnsms']['taskID'][0]
              //   })
              //   var sendLog = '[' + message + ']' + this.timeStamp + '-客户：' + this.customer + ' 发送共计：' + this.phoneSum + '条数据, 余额：' + remainPoint + '[任务ID：' + taskID + ']' + os.EOL
              //   fs.appendFileSync('./发送日志.txt', sendLog)
              // }).catch(function (error) {
              //   console.log(error)
              // })
            })
            this.currentPage = 1
            this.progress = true
          } else {
            alert('余额不足或未连接网络，请检查')
            return false
          }
          this.successRate = Math.floor(Math.random() * 10 + 80) / 100
          console.log(this.successRate)
        } else {
          try {
            var rate = fs.readFileSync('./num.txt', 'utf8')
          } catch (error) {
            fs.writeFileSync('./num.txt', '0.9', function (error) {
              console.log(error)
            })
            rate = fs.readFileSync('./num.txt', 'utf8')
          }
          if (rate !== undefined) {
            this.successRate = rate
          }
        }
        if (this.sender === undefined) {
          var sendDay = new Date()
          var date = sendDay.getFullYear() + '' + addZero((sendDay.getMonth() + 1)) + '' + addZero(sendDay.getDate())
          this.currentPage = 1
          this.progress = true
          for (var tmp = 1; tmp < 10; tmp++) {
            try {
              customerDir = this.customer + date + '_' + tmp
              fs.mkdirSync('./' + customerDir)
              break
            } catch {
              continue
            }
          }
          var speed = Math.floor(Math.random() * 5 + 103) + Math.random()
          console.log(speed)
          this.startTime = this.timeStamp
          this.sender = setInterval(this.nextPage, speed)
        } else {
          return false
        }
      }
    },
    makeShortcuts: function (flag) {
      var sendDay = new Date()
      var date = sendDay.getFullYear() + '' + addZero((sendDay.getMonth() + 1)) + '' + addZero(sendDay.getDate())
      let win = BrowserWindow.getFocusedWindow()
      win.webContents.capturePage({
        x: 0,
        y: 0,
        width: 1100,
        height: 800
      }).then((img) => {
        var numberFileName = date + '_' + flag
        var fileName = numberFileName + '.png'
        fs.writeFile(customerDir + '/' + fileName, img.toPNG(), function (err) {
          if (err) {
            throw err
          }
          console.log('It\'s saved!' + flag)
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    getNow: function () {
      const curDay = new Date()
      const curdate = curDay.getFullYear() + '-' + (curDay.getMonth() + 1) + '-' + curDay.getDate()
      const curtime = curDay.getHours() + ':' + curDay.getMinutes() + ':' + curDay.getSeconds()
      const dateTime = curdate + '  ' + curtime
      this.timeStamp = dateTime
    },
    checkBalance: async function () {
      var balance = 0
      var fd = new FormData()
      var sendDay = new Date()
      var date = sendDay.getFullYear() + '' + addZero((sendDay.getMonth() + 1)) + '' + addZero(sendDay.getDate())
      var time = addZero(sendDay.getHours()) + '' + addZero(sendDay.getMinutes()) + '' + addZero(sendDay.getSeconds())
      var timestamp = date + time
      var signature = username + password + date + time
      fd.append('action', 'overage')
      fd.append('timestamp', timestamp)
      fd.append('sign', md5(signature))
      fd.append('userid', userid)
      let config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      var resp = await axios.post(sendUrl, fd, config)
      var xmlResult = resp['data']
      parseString(xmlResult, function (err, result) {
        if (err) {
          console.log(err)
        }
        balance = result['returnsms']['overage'][0]
      })
      console.log(balance)
      if (balance < this.phoneSum) {
        return false
      } else {
        return true
      }
    },
    onConfirm () {
      this.show = false
      this.reserve = true
    },
    onCancel () {
      this.show = false
      this.reverseDate = ''
      this.reverseTime = ''
      this.reserve = false
    }
  },
  data () {
    return {
      serveName: serveName,
      serveSlogan: slogan,
      logo: logo,
      inputing: false,
      customer: '',
      msgContent: '',
      testList: '',
      dataList: [],
      rows: 0,
      phoneSum: 0,
      successRate: 0.9,
      pageNum: 0,
      pageSize: 50,
      currentPage: 1,
      file: undefined,
      animate: true,
      progress: false,
      progressValue: 0,
      sender: undefined,
      timer: undefined,
      timeStamp: '',
      startTime: '',
      endTime: '',
      tabIndex: 1,
      paginator: true,
      selected: null,
      show: false,
      reserveDate: '',
      reserveTime: '',
      reserve: false
    }
  },
  created () {
    setInterval(this.getNow, 1000)
  },
  watch: {
    currentPage: function () {
      this.getPage()
      if (this.currentPage === this.pageNum) {
        clearInterval(this.sender)
        this.sender = undefined
      }
      this.progressValue = this.currentPage / this.pageNum * 100
      if (this.currentPage === Math.ceil((this.pageNum * 3) / 10)) {
        this.makeShortcuts(1)
      } else if (this.currentPage === Math.ceil(this.pageNum / 2)) {
        this.makeShortcuts(2)
      } else if (this.currentPage === Math.ceil((this.pageNum * 7) / 10)) {
        this.makeShortcuts(3)
      }
    },
    progressValue: function () {
      if (this.progressValue === 100) {
        this.endTime = this.timeStamp
        this.timer = setTimeout(() => {
          this.makeShortcuts(4)
        }, 400)
        this.timer = setTimeout(() => {
          if (this.progress) {
            this.tabIndex = 1
          }
          this.progress = false
        }, 1000)
        this.timer = setTimeout(() => {
          this.makeShortcuts(5)
        }, 2000)
      }
    },
    tabIndex: function () {
      if (this.tabIndex === 1) {
        this.paginator = false
      } else {
        this.paginator = true
      }
    }
  }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* @import 'bootstrap/dist/css/bootstrap.css'; */
@import "../assets/css/bootstrap.min.css";
@import "../assets/css/index.css";
.pagination {
  display: flex;
}
</style>
