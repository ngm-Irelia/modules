$(function() {
  var viewBusiness = {
    // // 模拟ztree初始数据
    // zNodes: [
    //   { id:1, pId:0, name:"南京分行（13）", open:true, icon:"../stylesheets/common/zTreeStyle/img/diy/bank.png"},
    //   { id:11, pId:1, name:"城东支行（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:12, pId:1, name:"奥体支行（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:13, pId:1, name:"仙林支行（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:11, pId:1, name:"江宁支行（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:12, pId:1, name:"雨花支行（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:13, pId:1, name:"红山支行（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
		// 	{ id:11, pId:1, name:"城东支行（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:2, pId:0, name:"苏州分行（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/bank.png"},
    //   { id:21, pId:2, name:"叶子节点1（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:22, pId:2, name:"叶子节点2（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:23, pId:2, name:"叶子节点3（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:3, pId:0, name:"徐州分行（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/bank.png"},
    //   { id:31, pId:3, name:"叶子节点1（13）", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:32, pId:3, name:"叶子节点2", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"},
    //   { id:33, pId:3, name:"叶子节点3", icon:"../stylesheets/common/zTreeStyle/img/diy/flag.png"}
    // ],
    init: function(argument) {
      this.render();
      this.bind();
      this.loadDate("-6");
      this.loadInitData();
    },
    render: function() {
      var me = this;
      me.hiraOrg = $('#js-hiraOrg');

      me.rankBtn = $('#js-ranking-btn');
      me.rankPopup = $('#js-ranking-popup');
      me.rankPopupClose = $('#js-ranking-popup .js-close');

      me.modelBtn = $('.js-model-btn');
      me.modelPopup = $('#js-model-popup');
      me.modelPopupClose = $('#js-model-popup .js-close');

      me.startDateInput = $('#js-date-start');
      me.endDateInput = $('#js-date-end');
      me.monthBtn = $('#js-month');
      me.halfYearBtn = $('#js-half-year');
      me.yearBtn = $('#js-year');
      me.searchInput = $('#js-search');
      me.searchBtn = $('#js-search-btn');

      me.stripline = $('#js-stripline tbody');
      me.business = $('#js-business tbody');

      me.branchRank = $('#js-branch-ranking tbody');
      me.branchBox = $('#js-branch-box');
      // me.subbranchRank = $('#js-subbranch-ranking tbody');
      // me.subbranchBox = $('#js-subbranch-box');

      me.modelDetail = $('#js-model tbody');
      me.modelDetailBox = $('#js-model-box');
    },
    bind: function() {
      var me = this;
      me.rankBtn.on('click', $.proxy(me.handleRankBtnClick, this));
      me.rankPopupClose.on('click', $.proxy(me.handleRankCloseBtnClick, this));

      // me.modelBtn.on('click', $.proxy(me.handleModelBtnClick, this));
      me.stripline.on('click', '.js-model-btn', $.proxy(me.handleModelBtnClick, this));
      me.business.on('click', '.js-model-btn', $.proxy(me.handleModelBtnClick, this));
      me.modelPopupClose.on('click', $.proxy(me.handleModelCloseBtnClick, this));

      me.searchInput.on('keyup', $.proxy(me.handleSearchEnter, this));
      me.searchBtn.on('click', $.proxy(me.handleSearchClick, this));
      me.monthBtn.on('click', $.proxy(me.handleMonthBtnClick, this));
      me.halfYearBtn.on('click', $.proxy(me.handleHalfYearBtnClick, this));
      me.yearBtn.on('click', $.proxy(me.handleYearBtnClick, this));
    },
    loadInitData: function() {
      var me = this;
      var params = {
        searchType: 'Business',
        userID: '',
        startDate: me.startDateInput.val(),
        endDate: me.endDateInput.val(),
        branchName: me.branchName || '南京银行'
      };
      me.getAllData(params, me.loadFuncs);
    },
    loadFuncs: function(result) {
      var data = result.data || [],
        bank = data.bank || [],
        zNodes = bank.branch || [],
        statistic = data.statistic || {},
        lines = data.lines || [],
        businesses = data.businesses || [],
        bankRanking = data.bankRanking || {};

      // ztree初始化页面时只加载一次
      if(!this.isZtreeLoaded) {
        this.loadZtree(zNodes);
      }
      this.loadStatisticData(statistic);
      this.loadStripline(lines);
      this.loadBusiness(businesses);
      this.loadRanking(bankRanking);
    },
    getAllData: function(params, callback) {
      var me = this;
      // http://172.16.87.124:8081/audit_nj/riskview/search  真实地址
      // http://localhost:8080/audit/ds/view-business/vb.json 测试地址
			
			let data = {
  "code": 200,
  "data": {
    "statistic": {
      "modeltotal": 89679,
      "issuetotal": 88841
    },
    "bank": {
      "name": "南京银行",
      "branch": [
        {
          "id": "999999",
          "icon": "branch.png",
          "open": true,
          "pId": "0",
          "name": "科瑞明软件有限公司"
        },
        {
          "id": "9900",
          "icon": "branch.png",
          "open": true,
          "pId": "0",
          "name": "南京银行"
        },
        {
          "id": "0106",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "总行消费金融中心"
        },
        {
          "id": "9901",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "总行清算中心"
        },
        {
          "id": "0109",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "总行交易银行部"
        },
        {
          "id": "0110",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "总行资金运营中心"
        },
        {
          "id": "0123",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "总行资产保全部"
        },
        {
          "id": "4000",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "金融同业专营机构"
        },
        {
          "id": "4099",
          "icon": "subbranch.png",
          "pId": "4000",
          "name": "南京银行南京分行专营"
        },
        {
          "id": "4002",
          "icon": "subbranch.png",
          "pId": "4000",
          "name": "南京银行泰州分行专营"
        },
        {
          "id": "4003",
          "icon": "subbranch.png",
          "pId": "4000",
          "name": "南京银行上海分行专营"
        },
        {
          "id": "4014",
          "icon": "subbranch.png",
          "pId": "4000",
          "name": "南京银行连云港分行专营"
        },
        {
          "id": "4016",
          "icon": "subbranch.png",
          "pId": "4000",
          "name": "南京银行徐州分行专营"
        },
        {
          "id": "4017",
          "icon": "subbranch.png",
          "pId": "4000",
          "name": "南京银行淮安分行专营"
        },
        {
          "id": "0300",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "上海分行"
        },
        {
          "id": "0301",
          "icon": "subbranch.png",
          "pId": "0300",
          "name": "上海分行营业部"
        },
        {
          "id": "6003",
          "icon": "subbranch.png",
          "pId": "0300",
          "name": "上海分行消费金融中心"
        },
        {
          "id": "0307",
          "icon": "subbranch.png",
          "pId": "0300",
          "name": "上海浦东支行"
        },
        {
          "id": "0308",
          "icon": "subbranch.png",
          "pId": "0300",
          "name": "上海徐汇支行"
        },
        {
          "id": "0200",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "泰州分行"
        },
        {
          "id": "0220",
          "icon": "subbranch.png",
          "pId": "0200",
          "name": "泰州分行营业部"
        },
        {
          "id": "6002",
          "icon": "subbranch.png",
          "pId": "0200",
          "name": "泰州分行消费金融中心"
        },
        {
          "id": "0221",
          "icon": "subbranch.png",
          "pId": "0200",
          "name": "靖江支行"
        },
        {
          "id": "0222",
          "icon": "subbranch.png",
          "pId": "0200",
          "name": "泰州高港支行"
        },
        {
          "id": "0400",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "无锡分行"
        },
        {
          "id": "0401",
          "icon": "subbranch.png",
          "pId": "0400",
          "name": "无锡分行营业部"
        },
        {
          "id": "6004",
          "icon": "subbranch.png",
          "pId": "0400",
          "name": "无锡分行消费金融中心"
        },
        {
          "id": "0415",
          "icon": "subbranch.png",
          "pId": "0400",
          "name": "江阴城东支行"
        },
        {
          "id": "0406",
          "icon": "subbranch.png",
          "pId": "0400",
          "name": "江阴支行"
        },
        {
          "id": "0407",
          "icon": "subbranch.png",
          "pId": "0400",
          "name": "无锡惠山支行"
        },
        {
          "id": "0409",
          "icon": "subbranch.png",
          "pId": "0400",
          "name": "宜兴支行"
        },
        {
          "id": "0500",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "北京分行"
        },
        {
          "id": "0501",
          "icon": "subbranch.png",
          "pId": "0500",
          "name": "北京分行清算中心"
        },
        {
          "id": "6005",
          "icon": "subbranch.png",
          "pId": "0500",
          "name": "北京分行消费金融中心"
        },
        {
          "id": "0506",
          "icon": "subbranch.png",
          "pId": "0500",
          "name": "北京分行营业部"
        },
        {
          "id": "0508",
          "icon": "subbranch.png",
          "pId": "0500",
          "name": "北京万柳支行"
        },
        {
          "id": "0511",
          "icon": "subbranch.png",
          "pId": "0500",
          "name": "北京中关村支行"
        },
        {
          "id": "0509",
          "icon": "subbranch.png",
          "pId": "0500",
          "name": "北京朝阳门支行"
        },
        {
          "id": "0513",
          "icon": "subbranch.png",
          "pId": "0500",
          "name": "北京顺义支行"
        },
        {
          "id": "0512",
          "icon": "subbranch.png",
          "pId": "0500",
          "name": "北京呼家楼支行"
        },
        {
          "id": "0600",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "南通分行"
        },
        {
          "id": "0601",
          "icon": "subbranch.png",
          "pId": "0600",
          "name": "南通分行营业部"
        },
        {
          "id": "0609",
          "icon": "subbranch.png",
          "pId": "0600",
          "name": "启东支行"
        },
        {
          "id": "0610",
          "icon": "subbranch.png",
          "pId": "0600",
          "name": "如东支行"
        },
        {
          "id": "0612",
          "icon": "subbranch.png",
          "pId": "0600",
          "name": "海门支行"
        },
        {
          "id": "0614",
          "icon": "subbranch.png",
          "pId": "0600",
          "name": "南通开发区支行"
        },
        {
          "id": "0616",
          "icon": "subbranch.png",
          "pId": "0600",
          "name": "海门临江新区支行"
        },
        {
          "id": "0700",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "杭州分行"
        },
        {
          "id": "0701",
          "icon": "subbranch.png",
          "pId": "0700",
          "name": "杭州分行营业部"
        },
        {
          "id": "0710",
          "icon": "subbranch.png",
          "pId": "0700",
          "name": "杭州余杭支行"
        },
        {
          "id": "0708",
          "icon": "subbranch.png",
          "pId": "0700",
          "name": "杭州城北支行"
        },
        {
          "id": "0711",
          "icon": "subbranch.png",
          "pId": "0700",
          "name": "杭州城东小薇企业专营支行"
        },
        {
          "id": "0715",
          "icon": "subbranch.png",
          "pId": "0700",
          "name": "杭州城南小微企业专营支行"
        },
        {
          "id": "0716",
          "icon": "subbranch.png",
          "pId": "0700",
          "name": "杭州滨江科技支行"
        },
        {
          "id": "0800",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "扬州分行"
        },
        {
          "id": "6008",
          "icon": "subbranch.png",
          "pId": "0800",
          "name": "扬州分行营业部"
        },
        {
          "id": "0807",
          "icon": "subbranch.png",
          "pId": "0800",
          "name": "江都支行"
        },
        {
          "id": "0811",
          "icon": "subbranch.png",
          "pId": "0800",
          "name": "扬州龙川支行"
        },
        {
          "id": "0810",
          "icon": "subbranch.png",
          "pId": "0800",
          "name": "高邮支行"
        },
        {
          "id": "0812",
          "icon": "subbranch.png",
          "pId": "0800",
          "name": "宝应支行"
        },
        {
          "id": "0813",
          "icon": "subbranch.png",
          "pId": "0800",
          "name": "扬州城东支行"
        },
        {
          "id": "0900",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "苏州分行"
        },
        {
          "id": "0901",
          "icon": "subbranch.png",
          "pId": "0900",
          "name": "苏州分行营业部"
        },
        {
          "id": "0909",
          "icon": "subbranch.png",
          "pId": "0900",
          "name": "苏州吴中支行"
        },
        {
          "id": "0907",
          "icon": "subbranch.png",
          "pId": "0900",
          "name": "常熟支行"
        },
        {
          "id": "0911",
          "icon": "subbranch.png",
          "pId": "0900",
          "name": "昆山支行"
        },
        {
          "id": "1008611",
          "icon": "subbranch.png",
          "pId": "8100",
          "name": "昆山高岭分行"
        },
        {
          "id": "11111111",
          "icon": "subbranch.png",
          "pId": "1008611",
          "name": "昆山高岭城北中心支行"
        },
        {
          "id": "1800",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "淮安分行"
        },
        {
          "id": "1801",
          "icon": "subbranch.png",
          "pId": "1800",
          "name": "淮安分行营业部"
        },
        {
          "id": "7100",
          "icon": "branch.png",
          "open": true,
          "pId": "0",
          "name": "宜兴阳羡村镇银行"
        },
        {
          "id": "7107",
          "icon": "subbranch.png",
          "pId": "7100",
          "name": "和桥支行"
        },
        {
          "id": "7108",
          "icon": "subbranch.png",
          "pId": "7100",
          "name": "周铁支行"
        },
        {
          "id": "7115",
          "icon": "subbranch.png",
          "pId": "7107",
          "name": "和桥支行营业部"
        },
        {
          "id": "7116",
          "icon": "subbranch.png",
          "pId": "7107",
          "name": "和桥支行清算中心"
        },
        {
          "id": "7118",
          "icon": "subbranch.png",
          "pId": "7108",
          "name": "周铁支行营业部"
        },
        {
          "id": "8000",
          "icon": "branch.png",
          "open": true,
          "pId": "0",
          "name": "昆山银行"
        },
        {
          "id": "8100",
          "icon": "subbranch.png",
          "pId": "8000",
          "name": "昆山银行城北分行"
        },
        {
          "id": "0912",
          "icon": "subbranch.png",
          "pId": "0900",
          "name": "苏州相城支行"
        },
        {
          "id": "0913",
          "icon": "subbranch.png",
          "pId": "0900",
          "name": "苏州新区支行"
        },
        {
          "id": "1100",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "盐城分行"
        },
        {
          "id": "1101",
          "icon": "subbranch.png",
          "pId": "1100",
          "name": "盐城分行营业部"
        },
        {
          "id": "1107",
          "icon": "subbranch.png",
          "pId": "1100",
          "name": "盐城盐都支行"
        },
        {
          "id": "1109",
          "icon": "subbranch.png",
          "pId": "1100",
          "name": "滨海支行"
        },
        {
          "id": "1108",
          "icon": "subbranch.png",
          "pId": "1100",
          "name": "东台支行"
        },
        {
          "id": "1110",
          "icon": "subbranch.png",
          "pId": "1100",
          "name": "建湖支行"
        },
        {
          "id": "1113",
          "icon": "subbranch.png",
          "pId": "1100",
          "name": "大丰支行"
        },
        {
          "id": "1500",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "江北新区分行"
        },
        {
          "id": "0160",
          "icon": "subbranch.png",
          "pId": "1500",
          "name": "江北新区分行营业部"
        },
        {
          "id": "0143",
          "icon": "subbranch.png",
          "pId": "1500",
          "name": "大厂支行"
        },
        {
          "id": "0148",
          "icon": "subbranch.png",
          "pId": "1500",
          "name": "高新开发区支行"
        },
        {
          "id": "0182",
          "icon": "subbranch.png",
          "pId": "1500",
          "name": "六合支行"
        },
        {
          "id": "1000",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "常州分行"
        },
        {
          "id": "1001",
          "icon": "subbranch.png",
          "pId": "1000",
          "name": "常州分行营业部"
        },
        {
          "id": "1007",
          "icon": "subbranch.png",
          "pId": "1000",
          "name": "金坛支行"
        },
        {
          "id": "1010",
          "icon": "subbranch.png",
          "pId": "1000",
          "name": "常州钟楼支行"
        },
        {
          "id": "1200",
          "icon": "subbranch.png",
          "pId": "9900",
          "name": "镇江分行"
        },
        {
          "id": "1201",
          "icon": "subbranch.png",
          "pId": "1200",
          "name": "镇江分行清算中心"
        },
        {
          "id": "1206",
          "icon": "subbranch.png",
          "pId": "1200",
          "name": "镇江分行营业部"
        },
        {
          "id": "1008615",
          "icon": "subbranch.png",
          "pId": "123052",
          "name": "第二分行下中心支行"
        },
        {
          "id": "301001010010",
          "icon": "subbranch.png",
          "pId": "1230",
          "name": "测试第一分行"
        },
        {
          "id": "1230",
          "icon": "branch.png",
          "open": true,
          "pId": "0",
          "name": "测试总行"
        },
        {
          "id": "123052",
          "icon": "subbranch.png",
          "pId": "1230",
          "name": "测试第二分行"
        },
        {
          "id": "1230503",
          "icon": "subbranch.png",
          "pId": "301001010010",
          "name": "测试第一分行下中心支行"
        },
        {
          "id": "1230501",
          "icon": "subbranch.png",
          "pId": "1230503",
          "name": "测试第一支行"
        }
      ]
    },
    "lines": [
      {
        "amount": 10237,
        "modeltotal": 111640,
        "model": 10384,
        "issuetotal": 51920,
        "department": "授信审批部",
        "amounttotal": 51185,
        "issue": 11164
      },
      {
        "amount": 10455,
        "modeltotal": 110220,
        "model": 10591,
        "issuetotal": 52955,
        "department": "金融同业部",
        "amounttotal": 52275,
        "issue": 11022
      },
      {
        "amount": 9879,
        "modeltotal": 115680,
        "model": 10474,
        "issuetotal": 52370,
        "department": "零售金融部",
        "amounttotal": 49395,
        "issue": 11568
      },
      {
        "amount": 10053,
        "modeltotal": 112420,
        "model": 9932,
        "issuetotal": 49660,
        "department": "运营管理部",
        "amounttotal": 50265,
        "issue": 11242
      },
      {
        "amount": 10737,
        "modeltotal": 113930,
        "model": 9613,
        "issuetotal": 48065,
        "department": "公司金融部",
        "amounttotal": 53685,
        "issue": 11393
      },
      {
        "amount": 9968,
        "modeltotal": 111520,
        "model": 11012,
        "issuetotal": 55060,
        "department": "交易银行部",
        "amounttotal": 49840,
        "issue": 11152
      },
      {
        "amount": 10437,
        "modeltotal": 114800,
        "model": 11572,
        "issuetotal": 57860,
        "department": "小企业金融部",
        "amounttotal": 52185,
        "issue": 11480
      },
      {
        "amount": 9598,
        "modeltotal": 98920,
        "model": 10512,
        "issuetotal": 52560,
        "amounttotal": 47990,
        "issue": 9892,
        "department": "风险合规部"
    },
    {
        "amount": 10821,
        "modeltotal": 99140,
        "model": 9683,
        "issuetotal": 48415,
        "amounttotal": 54105,
        "issue": 9914,
        "department": "法律合规部"
    }
    ],
    "bankRanking": {
      "branch": [
        {
          "issuetotal": 20487,
          "bankname": "南京分行",
          "bankid": 1,
          "issuefinished": 10410,
          "ranking": "Top1"
        },
        {
          "issuetotal": 20894,
          "bankname": "南京银行",
          "bankid": 2,
          "issuefinished": 10640,
          "ranking": "Top2"
        },
        {
          "issuetotal": 21373,
          "bankname": "上海分行",
          "bankid": 3,
          "issuefinished": 10841,
          "ranking": "Top3"
        },
        {
          "issuetotal": 21004,
          "bankname": "泰州分行",
          "bankid": 4,
          "issuefinished": 10537,
          "ranking": "Top4"
        }
      ]
    },
    "businesses": [
      {
        "amount": 9360,
        "modeltotal": 102000,
        "model": 9992,
        "issuetotal": 49960,
        "amounttotal": 46800,
        "issue": 10200,
        "business": "并购贷款"
      },
      {
        "amount": 9873,
        "modeltotal": 96740,
        "model": 9373,
        "issuetotal": 46865,
        "amounttotal": 49365,
        "issue": 9674,
        "business": "非小企业贷后管理"
      },
      {
        "amount": 10266,
        "modeltotal": 100430,
        "model": 10283,
        "issuetotal": 51415,
        "amounttotal": 51330,
        "issue": 10043,
        "business": "不规范经营"
      },
      {
        "amount": 9919,
        "modeltotal": 98250,
        "model": 10166,
        "issuetotal": 50830,
        "amounttotal": 49595,
        "issue": 9825,
        "business": "票据业务"
      },
      {
        "amount": 10016,
        "modeltotal": 103600,
        "model": 9498,
        "issuetotal": 47490,
        "amounttotal": 50080,
        "issue": 10360,
        "business": "对公存款"
      },
      {
        "amount": 9258,
        "modeltotal": 101500,
        "model": 10578,
        "issuetotal": 52890,
        "amounttotal": 46290,
        "issue": 10150,
        "business": "贷后管理"
      },
      {
        "amount": 9730,
        "modeltotal": 97450,
        "model": 9594,
        "issuetotal": 47970,
        "amounttotal": 48650,
        "issue": 9745,
        "business": "对公授信执行"
      }
    ]
  },
  "msg": "获取成功"
};


if (typeof callback === 'function') {
          var func = $.proxy(callback, me);
          func(data);
        }
				
      
      // $.post('http://localhost:8080/audit/ds/view-business/1.json', {searchType: params.searchType, userID: params.userID, startDate: params.startDate,
      //   endDate: params.endDate, branchName: params.branchName}, function(data) {
      //     if( typeof callback === 'function') {
      //       var func = $.proxy(callback, me);
      //       func( data );
      //     }
      // }, 'json');
    },
    // getRanking: function(callback) {
    //   var me = this;
    //   $.get('http://localhost:8080/audit/ds/view-business/2.json', function(data) {
    //     if( typeof callback === 'function') {
    //       var func = $.proxy(callback, me);
    //         func( data );
    //     }
    //   }, 'json');
    // },
    getModelDetail(params, callback) {
      var me = this;

      // http://172.16.87.124:8081/audit_nj/riskview/searchModel 真实地址
      // http://localhost:8080/audit/ds/view-business/3.json 测试地址
      window.view.fetch('../ds/view-business/3.json', {
        method: 'POST',
        mode: 'cors',
        body: new URLSearchParams({
          lineName: params.lineName,
          startDate: params.startDate,
          endDate: params.endDate,
          branchName: params.branchName
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      }).then(function (data) {
        if (typeof callback === 'function') {
          var func = $.proxy(callback, me);
          func(data);
        }
      });
      // $.post('http://localhost:8080/audit/ds/view-business/3.json', {id: id}, function(data) {
      //   if( typeof callback === 'function') {
      //     var func = $.proxy(callback, me);
      //       func( data );
      //   }
      // }, 'json');
    },
    /**
     * 初始化左侧机构的层级结构
     * @param {object} setting 
     * @param {array} zNodes 
     */
    loadZtree: function(zNodes) {
      //标识ztree是否已经加载过 加载过：true
      this.isZtreeLoaded = true;
      // ztree配置
      var setting = {
        data: {
          simpleData: {
            enable: true
          }
        },
        view: {
          fontCss: { color: "#39B2FC" }
        },
        callback: {
          beforeClick: $.proxy(this.ztreeBeforeClick, this),
          onClick: $.proxy(this.zTreeOnClick, this)
        }
        // callback: {
        //   beforeClick: this.ztreeBeforeClick,
        //   onClick: this.zTreeOnClick
        // }
      };
      // 把返回数据里面的icon字段对应的图片地址加上相对路径
      var zNodesStr = JSON.stringify(zNodes);
      var _zNodesStr = zNodesStr.replace(/("icon":")(\w+\.png")/g, "$1../stylesheets/common/zTreeStyle/img/diy/$2");

      var me = this;
      var ztree = $.fn.zTree.init(me.hiraOrg, setting, JSON.parse(_zNodesStr))
      //默认选中 南京银行
      var node = ztree.getNodeByParam("name", '南京银行');//根据name找到该节点
      ztree.selectNode(node);//根据该节点选中

      me.loadScrollBar(me.hiraOrg);
    },
    /**
     * 动态解析业务数据，渲染业务条线
     * @param {array} businesses 
     */
    loadBusiness: function(businesses) {
      var _html = '';
      for (var business of businesses) {
        _html += `<tr>
          <td class="first" data-name="${business.business}">${business.business}</td>
          <td>
            <div class="js-model-btn squarebar" data-percent="${ Math.round(business.model/business.modeltotal * 100) }%">
              <div class="squarebar-bar blue"></div>
              <span class="squarebar-percent">${ business.model }</span>
            </div>
          </td>
          <td>
            <div class="js-model-btn squarebar" data-percent="${ Math.round(business.amount/business.amounttotal * 100) }%">
              <div class="squarebar-bar yellow"></div>
              <span class="squarebar-percent">${ business.amount }</span>
            </div>
          </td>
          <td>
            <div class="js-model-btn squarebar" data-percent="${ Math.round(business.issue/business.issuetotal * 100) }%">
              <div class="squarebar-bar green"></div>
              <span class="squarebar-percent">${ business.issue }</span>
            </div>
          </td>
        </tr>`;
      }
      this.business.html(_html);
      this.loadBar('squarebar', 'squarebar-bar');
    },
    /**
     * 动态渲染 模型问题总数、涉及问题金额总数
     * @param {object} statis 统计信息
     */
    loadStatisticData: function(statis) {
      var modelTotal = statis.modeltotal,
        issueTotal = statis.issuetotal;
      
      this.loadCountUp('js-model-total', modelTotal);
      this.loadCountUp('js-issue-total', issueTotal);
    },
    /**
     * 动态解析条线数据，渲染条线
     * @param {array} lines 
     */
    loadStripline: function(lines) {
      var _html = '';
      for (var line of lines) {
        _html += `<tr>
          <td class="first" data-name="${line.department}">
          <a class="stripline-link" href="./portrayal-business.html?date=${encodeURIComponent(this.endDateInput.val())}&orgname=${encodeURIComponent(this.branchName|| '南京银行')}&linename=${encodeURIComponent(line.department)}">${line.department}</a></td>
          <td>
            <div class="js-model-btn squarebar" data-percent="${ Math.round(line.model/line.modeltotal * 100) }%">
              <div class="squarebar-bar blue"></div>
              <span class="squarebar-percent">${ line.model }</span>
            </div>
          </td>
          <td>
            <div class="js-model-btn squarebar" data-percent="${ Math.round(line.amount/line.amounttotal * 100) }%">
              <div class="squarebar-bar yellow"></div>
              <span class="squarebar-percent">${ line.amount }</span>
            </div>
          </td>
          <td>
            <div class="js-model-btn squarebar" data-percent="${ Math.round(line.issue/line.issuetotal * 100) }%">
              <div class="squarebar-bar green"></div>
              <span class="squarebar-percent">${ Math.round(line.issue/line.issuetotal * 100) }%</span>
            </div>
          </td>
        </tr>`;
      }
      this.stripline.html(_html);
    },
    /**
     * 动态解析分行支行排名数据，渲染排名弹框
     * @param {Object} data 
     */
    loadRanking: function(rankData){
      var branchData = rankData.branch || [];
        // subbranchData = rankData.subBranch || [];
      var branchHtml = '';
      // subBranchHtml = '';
      //解析分行排名
      for (var [index, value] of branchData.entries()) {
        branchHtml += `<tr>
          <td class="text-center">${ index+1 }</td>
          <td>${ value.bankname }</td>
          <td class="third">
            <div class="circlebar ranking-table-bar" data-percent="${ Math.round(value.issuefinished/value.issuetotal * 100) }%">
              <div class="circlebar-bar blue inner"></div>
            </div>
          </td>
          <td>${ value.issuefinished }</td>
          <td>${ value.ranking }</td>
        </tr>`;
      }
      //解析支行排名
      // for (var [index, value] of subbranchData.entries()) {
      //   subBranchHtml += `<tr>
      //     <td class="text-center">${ index+1 }</td>
      //     <td>${ value.bankname }</td>
      //     <td class="third">
      //       <div class="circlebar ranking-table-bar" data-percent="${ Math.round(value.issuefinished/value.issuetotal * 100) }%">
      //         <div class="circlebar-bar blue inner"></div>
      //       </div>
      //     </td>
      //     <td>${ value.issuefinished }</td>
      //     <td>${ value.ranking }</td>
      //   </tr>`;
      // }
      this.branchRank.html(branchHtml);
      // this.subbranchRank.html(subBranchHtml);

      this.loadScrollBar(this.branchBox);
      // this.loadScrollBar(this.subbranchBox);
      this.loadBar('circlebar', 'circlebar-bar');
    },
    /**
     * 动态解析模型数据，渲染模型明细弹框
     * @param {Object} data 
     */
    loadModelDetail: function(data) {
      var result = data.data || {},
        models = result.models || [];
      var _html = '';

      for (const [index, model] of models.entries()) {
        _html += `<tr>
          <td>${ index+1 }</td>
          <td>${ model.modelname }</td>
          <td>${ model.besinessname }</td>
          <td>${ model.risklevel }</td>
          <td>${ model.involvedamount }</td>
          <td>${ model.risknum }</td>
          <td>${ model.solvedproblem }</td>
        </tr>`;
      }
      this.modelDetail.html(_html);
      this.loadScrollBar(this.modelDetailBox);
    },
    /**
     * 加载滚动条
     * @param {$()} ele 
     */
    loadScrollBar: function(ele) {
      try{
        !!ele.data("mCS") && ele.mCustomScrollbar("destroy"); //Destroy
      }catch (e){
          ele.data("mCS",''); //手动销毁             
      }        
      ele.mCustomScrollbar({
        theme: "minimal", 
        axis: 'y',
        autoHideScrollbar: true
      });
    },
    /**
     * 根据条线的data-percent动态设置宽度
     * @param {string} pele 父元素
     * @param {string} cele 子元素
     */
    loadBar: function(pele, cele) {
      $('.'+pele).each(function(){
        $(this).find('.'+cele).css('width', $(this).attr('data-percent'));
      });
    },
    /**
     * 数字自动增加的动态变化效果
     * @param {string} targetElement 目标数字所在位置的id
     * @param {number} count 要变化的数字
     */
    loadCountUp: function (targetElement, count) {
      var options = {
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.',
      };
      var demo = new CountUp(targetElement, 0, count, 0, 2, options);
      if (!demo.error) {
        demo.start();
      } else {
        console.error(demo.error);
      }
    },
    ztreeBeforeClick: function(treeId, treeNode, clickFlag) {
      this.branchName = treeNode.name;
      this.loadInitData();
    },
    zTreeOnClick: function(event, treeId, treeNode, clickFlag) {
      // console.log('我被点击了：');
      // console.log(treeNode);
    },
    loadDate: function(interval) {
      var me = this;
      jeDate("#js-date-start", {
        isinitVal: true,
        initDate: [{ MM: interval }, true],
        format: "YYYY-MM-DD",
        theme: { bgcolor: "#202b33", color: "#C7FEFF", pnColor: "#d2d2d2" },
        donefun: function (obj) {
          me.loadInitData();
        }
      });
      jeDate("#js-date-end", {
        isinitVal:true,
        format: "YYYY-MM-DD",
        theme:{ bgcolor:"#202b33",color:"#C7FEFF", pnColor:"#d2d2d2"},
        donefun: function (obj) {
          me.loadInitData();
        }
      });
    },
    handleRankBtnClick: function(event) {
      var me = this;
      //打开modal
      me.popupOpen(me.rankPopup);
      
      //获取数据
      // me.getRanking(me.loadRanking);
    },
    handleRankCloseBtnClick: function() {
      this.popupClose(this.rankPopup);
    },
    handleModelBtnClick: function(event) {
      var me = this;
      var lineName = $(event.target).parents('td').siblings('.first').attr('data-name') || '';
      
      //获取数据
      var params = {
        startDate: me.startDateInput.val(),
        endDate: me.endDateInput.val(),
        branchName: me.branchName || '南京银行',
        lineName: lineName
      }
      me.getModelDetail(params, me.loadModelDetail);

      //打开modal
      me.popupOpen(me.modelPopup);
    },
    handleModelCloseBtnClick: function() {
      this.popupClose(this.modelPopup);
    },
    /**
     * 搜索框回车
     * @param {*} event 
     */
    handleSearchEnter: function(event) {
      if (event.keyCode == "13") {
        var searchValue = event.target.value;
        if(searchValue) {
          this.branchName = searchValue;
          this.loadInitData();
        }
      }
    },
    /**
     * 点击搜索按钮
     */
    handleSearchClick: function() {
      var searchValue = this.searchInput.val();
      if(searchValue) {
        this.branchName = searchValue;
        this.loadInitData();
      }
    },
    handleMonthBtnClick: function() {
      this.loadDate("-1");
      this.loadInitData();
    },
    handleHalfYearBtnClick: function() {
      this.loadDate("-6");
      this.loadInitData();
    },
    handleYearBtnClick: function() {
      this.loadDate("-12");
      this.loadInitData();
    },
    popupOpen: function(ele) {
      if(ele) {
        ele.css({"width":"100%", "height": "100%"});
      }
    },
    popupClose: function(ele) {
      if(ele) {
        ele.css({"width":"0", "height": "0"});
      }
    }
  };

  viewBusiness.init();
  
});