<template>
  <div class="search-wrap">
    <div class="search-top">
      <el-dropdown trigger="click" @command="handleMode">
        <el-button class="mode-button" type="primary">
          {{searchModeInChinese[mode]}}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="All">{{searchModeInChinese['All']}}</el-dropdown-item>
          <el-dropdown-item command="Title">{{searchModeInChinese['Title']}}</el-dropdown-item>
          <el-dropdown-item command="Author">{{searchModeInChinese['Author']}}</el-dropdown-item>
          <el-dropdown-item command="Publication">{{searchModeInChinese['Publication']}}</el-dropdown-item>
          <el-dropdown-item command="Keyword">{{searchModeInChinese['Keyword']}}</el-dropdown-item>
<!--          <el-dropdown-item command="Advanced">{{searchModeInChinese['Advanced']}}</el-dropdown-item>-->
        </el-dropdown-menu>
      </el-dropdown>
<!--      <el-input-->
<!--        v-if="mode!=='Advanced'"-->
<!--        class="search-input"-->
<!--        v-model="content"-->
<!--        placeholder="请键入搜索内容..."-->
<!--        @keydown.13.native="search"-->
<!--        @keydown.229="handleCN">-->
<!--      </el-input>-->
      <el-autocomplete
        class="search-input"
        :fetch-suggestions="querySearch"
        v-model="content"
        placeholder="请键入搜索内容..."
        @select="searchRecord"
        @keydown.13.native="search"
        @keydown.229="handleCN">
        <template slot-scope="{item}">
          <div style="display: flex; justify-content: space-between">
            <span>{{item.content}}</span>
            <span style="color: #777777;">{{searchModeInChinese[item.mode]}}</span>
          </div>
        </template>
      </el-autocomplete>
      <div class="advanced" v-if="mode==='Advanced'">
        <el-dropdown trigger="click" @command="handleRelationMode">
          <el-button class="relation-mode" type="primary" size="small">
            {{relationMode}}<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="AND">AND</el-dropdown-item>
            <el-dropdown-item command="OR">OR</el-dropdown-item>
            <el-dropdown-item command="NOT">NOT</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown trigger="click" @command="handleAdvancedMode">
          <el-button class="advanced-mode" type="primary" size="small">
            {{advancedMode}}<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="Title">标题</el-dropdown-item>
            <el-dropdown-item command="Author">作者</el-dropdown-item>
            <el-dropdown-item command="Affiliation">机构</el-dropdown-item>
            <el-dropdown-item command="Publication">刊物</el-dropdown-item>
            <el-dropdown-item command="Keyword">研究方向</el-dropdown-item>
            <el-dropdown-item command="Year">年份</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-input
          class="advanced-input"
          size="small"
          v-model="advancedContent"
          placeholder="请键入高级搜索内容..."
          @keydown.13.native="add"
          @keydown.229="handleCN">
        </el-input>
        <el-button class="advanced-add" @click="add" size="mini">
          <i class="el-icon-plus"></i>
        </el-button>
      </div>
      <el-button class="search-enter" @click="search">
        <i class="el-icon-search"></i>
      </el-button>
    </div>
    <div v-if="mode==='Advanced'" class="search-bottom">
      <div
        v-for="(advancedSearchItem, index) in advancedSearch"
        :class="'tag ' + advancedTypeDic[advancedSearchItem.mode]"
        :key="index"
        :title="advancedSearchItem.relation + ' ' + advancedSearchItem.mode + ': ' + advancedSearchItem.content">
        <div class="relation-text">{{advancedSearchItem.relation}}</div>
        <div class="tag-text">{{advancedSearchItem.content}}</div>
        <i class="el-icon-close tag-delete" @click="remove(index)"></i>
      </div>
    </div>
  </div>
</template>

<script>

import Search from "./Search";

export default {
  name: "SearchInTopBar",
  data(){
    return{
      mode: 'All',
      content: '',
      relationMode: 'AND',
      advancedMode: 'Title',
      advancedContent: '',
      advancedSearch: [],
      advancedTypeDic: {
        'Title': 'blue',
        'Author': 'red',
        'Affiliation': 'orange',
        'Publication': 'yellow',
        'Keyword': 'green',
        'Year': 'light-blue'},
      searchModeInChinese:Search.data().searchModeInChinese,
      records: []
    }
  },
  props: {
    searchMode: {
      type: String,
      default: null
    },
    searchContent: {
      type: String,
      default: null
    }
  },
  mounted() {
    if(this.searchMode){
      this.mode = this.searchMode;
    }
    if(this.searchContent){
      this.content = this.searchContent;
    }
    let records = sessionStorage.getItem('records');
    if(records){
      this.records = JSON.parse(records);
    }
  },
  methods: {
    querySearch(queryString, cb) {
      let records = this.records;
      let results = queryString ? records.filter(this.createFilter(queryString)) : records;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (record) => {
        return (record.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0&&record.mode === this.mode);
      };
    },
    searchRecord: function(record){
      window.location.href = '/search/' + record.mode + '/' + record.content;
    },
    handleMode(command) {
      this.mode = command;
    },
    handleRelationMode(command){
      this.relationMode = command;
    },
    handleAdvancedMode(command){
      this.advancedMode = command;
    },
    handleCN: function () {
      console.log('我捕获了');
    },
    search: function () {
      if(this.mode!=='Advanced'){
        let blankPattern = /^( )*$/;
        if (blankPattern.test(this.content)){
          this.$message({
            message:'请输入有效内容',
            type: 'error',
            duration: 2000
          });
        }else {
          let pattern = /[%\\/?+#&=]/;
          if(pattern.test(this.content)){
            this.$message({
              message:'搜索内容中不能包含字符 %,\\,/,?,+,#,&,=',
              type: 'error',
              duration: 2000
            });
          }else{
            let index = -1;
            for(let i = 0; i < this.records.length; i++){
              if(this.records[i].mode === this.mode&&this.records[i].content === this.content){
                index = i;
                break;
              }
            }
            if(index===-1){
              this.records.unshift({value:this.content+' - '+this.searchModeInChinese[this.mode], content:this.content ,mode:this.mode});
            }else{
              this.records.splice(index,1);
              this.records.unshift({value:this.content+' - '+this.searchModeInChinese[this.mode], content:this.content ,mode:this.mode});
            }
            this.records = this.records.slice(0,10);
            sessionStorage.setItem('records', JSON.stringify(this.records));
            window.location.href = '/search/' + this.mode + '/' + this.content;
          }
        }
      }else{
        if(!this.advancedSearch || this.advancedSearch.length === 0){
          this.$message({
            message:'请添加有效的高级搜索内容',
            type: 'error',
            duration: 2000
          });
        }else{
          let content = '';
          this.advancedSearch.forEach(function (advancedSearchItem) {
            content = content + advancedSearchItem.relation + ' ' + advancedSearchItem.mode + ':' + advancedSearchItem.content + ' ';
          })
          if(this.advancedSearch[0].relation !== 'NOT'){
            content = content.replace(' ', '，').split('，')[1];
          }
          console.log(content);
          sessionStorage.setItem('advancedContent', content);
          window.location.href = '/search/' + this.mode + '/' + content;
        }
      }
    },
    add: function () {
      let blankPattern = /^( )*$/;
      if (blankPattern.test(this.advancedContent)){
        this.$message({
          message:'请加入有效内容',
          type: 'error',
          duration: 2000
        });
      }else {
        let pattern = /[%\\/?+#&=]/;
        if(pattern.test(this.content)){
          this.$message({
            message:'搜索内容中不能包含字符 %,\\,/,?,+,#,&,=',
            type: 'error',
            duration: 2000
          });
        }else{
          this.advancedSearch.push({relation: this.relationMode, mode: this.advancedMode, content: this.advancedContent});
          this.advancedContent = '';
        }
      }
    },
    remove: function (index) {
      this.advancedSearch.splice(index, 1);
    }
  }
}
</script>

<style scoped>
.search-wrap{
  /*position: absolute;*/
  /*top: 1px;*/
  /*left: 10%;*/
  display: block;
  border: 2px solid #c4c7ce;
  border-radius: 7px;
}
.search-top{
  display: flex;
  border-radius: 7px;
  height: border-box;
}
.mode-button{
  background: transparent;
  width: 12vw;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  font-family: Noto Sans SC, sans-serif;
}
.el-button{
  border: 1px solid transparent;
}
.el-button:hover{
  background: #066;
}
.search-input{
  width: 31vw;
}
.el-input__inner{
  height: 41px;
  font-family: Noto Sans SC, sans-serif;
}
.advanced{
  display: flex;
  border: 4px solid #ffffff;
  border-right-width: 2px;
  border-left-width: 2px;
}
.relation-mode{
  width: 6vw;
  border-radius: 0;
  border-right: 1px solid #ffffff;
}
.advanced-mode{
  width: 9vw;
  border-radius: 0;
}
.advanced-input{
  width: 12vw;
}
.advanced-add{
  width: 4vw;
}
.search-enter{
  background: transparent;
  width: 4vw;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.el-icon-search{
  color: #ffffff;
}
.search-bottom{
  width: 44vw;
  min-height: 100px;
  max-height: 160px;
  /*margin-top: 1px;*/
  /*border: #ffffff dashed 2px;*/
  /*border-radius: 4px;*/
  /*padding: 2px;*/
  overflow-y: scroll;
}
.tag{
  height: 28px;
  width: 10vw;
  margin: 2px 6px;
  font-size: 18px;
  display: flex;
  float: left;
  padding-left: 2px;
  color: #ffffff;
}
.relation-text{
  margin-right: 2px;
}
.tag-text{
  width: 80%;
  overflow: hidden;
}
.tag-delete{
  margin-top: 4px;
  cursor: pointer;
}
.red{
  background-color: rgb(214, 39, 40);
}
.orange{
  background-color: rgb(255, 127, 14);
}
.yellow{
  background-color: rgb(214, 214, 8);
}
.green{
  background-color: rgb(44, 160, 44);
}
.blue{
  background-color: rgb(31, 119, 180);
}
.light-blue{
  background-color: #409eff;
}
</style>
