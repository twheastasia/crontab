export default {
	data() {
			return {
				dayRule:'',
				dayRuleSup:'',
				dateArr: [],
				resultList: [],
				isShow: false
			}
		},
		name: 'crontab-result',
		methods: {
			// 表达式值变化时，开始去计算结果
			expressionChange() {
				// 计算开始-隐藏结果
				this.isShow = false;
				// 获取规则数组[0秒、1分、2时、3日、4月、5星期、6年]
				let ruleArr = this.$options.propsData.ex.split(' ');
				// 用于记录进入循环的次数
				let nums = 0;
				// 用于暂时存符号时间规则结果的数组
				let resultArr = [];
				// 获取当前时间精确至[年、月、日、时、分、秒]
				let nowTime = new Date();
				let nowYear = nowTime.getFullYear();
				let nowMouth = nowTime.getMonth() + 1;
				let nowDay = nowTime.getDate();
				let nowHour = nowTime.getHours();
				let nowMin = nowTime.getMinutes();
				let nowSecond = nowTime.getSeconds();
				// 根据规则获取到近100年可能年数组、月数组等等
				this.getSecondArr(ruleArr[0]);
				this.getMinArr(ruleArr[1]);
				this.getHourArr(ruleArr[2]);
				this.getDayArr(ruleArr[3]);
				this.getMouthArr(ruleArr[4]);
				this.getWeekArr(ruleArr[5]);
				this.getYearArr(ruleArr[6], nowYear);
				// 将获取到的数组赋值-方便使用
				let ssDate = this.dateArr[0];
				let mmDate = this.dateArr[1];
				let hhDate = this.dateArr[2];
				let DDDate = this.dateArr[3];
				let MMDate = this.dateArr[4];
				let YYDate = this.dateArr[5];
				// 获取当前时间在数组中的索引
				let ssIdx = this.getIndex(ssDate, nowSecond);
				let mmIdx = this.getIndex(mmDate, nowMin);
				let hhIdx = this.getIndex(hhDate, nowHour);
				let DDIdx = this.getIndex(DDDate, nowDay);
				let MMIdx = this.getIndex(MMDate, nowMouth);
				let YYIdx = this.getIndex(YYDate, nowYear);
				// 重置月日时分秒的函数(后面用的比较多)
				const resetMouth = function(){
					MMIdx = 0;
					nowMouth = MMDate[MMIdx]
				}
				const resetDay = function(){
					DDIdx = 0;
					nowDay = DDDate[DDIdx]
				}
				const resetHour = function(){
					hhIdx = 0;
					nowHour = hhDate[hhIdx]
				}
				const resetMin = function(){
					mmIdx = 0;
					nowMin = mmDate[mmIdx]
				}
				const resetSecond = function() {
					ssIdx = 0;
					nowSecond = ssDate[ssIdx]
				}
				// 先行判断如果当前年份小于指定的年份则将月日时分秒重置到最小值
				if(nowYear < YYDate[0]){
					resetSecond();
					resetMin();
					resetHour();
					resetDay();
					resetMouth();
				}
				// 循环年份数组
				goYear: for(let Yi = YYIdx; Yi < YYDate.length; Yi++) {
					let YY = YYDate[Yi];
					//如果当前月份小于最小的月份则将几个数置0
					if(nowMouth < MMDate[0]){
						resetSecond();
						resetMin();
						resetHour();
						resetDay();
						resetMouth();
					}
					// 循环月份数组
					goMouth: for(let Mi = MMIdx; Mi < MMDate.length; Mi++) {
						//判断当前“月”是否超出范围，超出时将月日时分秒重置并跳出当月循环
						if(nowMouth > MMDate[MMDate.length-1]){
							resetSecond();
							resetMin();
							resetHour();
							resetDay();
							resetMouth();
							continue goYear;
						}
						// 赋值、方便后面运算
						let MM = MMDate[Mi];
						MM = MM < 10 ? '0' + MM : MM;
						// 循环日期数组
						goDay: for(let Di = DDIdx; Di < DDDate.length; Di++) {
							//判断当前“日”是否超出范围，超出时将日时分秒重置并跳出当前循环
							if(nowDay > DDDate[DDDate.length -1]){
								resetSecond();
								resetMin();
								resetHour();
								resetDay();
								continue goMouth;
							}
							// 赋值、方便后面运算
							let DD = DDDate[Di];
							DD = DD < 10 ? '0' + DD : DD;
							// 判断日期的合法性，不合法的话也是跳出当前循环
							if(this.checkDate(YY + '-' + MM + '-' + DD + ' 00:00:00') !== true && this.dayRule !== 'workDay' && this.dayRule !== 'lastWeek') {
								resetSecond();
								resetMin();
								resetHour();
								resetDay();
								continue goMouth;
							}
							// 如果日期规则中有值时
							if(this.dayRule === 'lastDay'){
								//****获取每月最后一天
								//获取下一天
								let myDD = Number(DD)+1;
								myDD = myDD < 10 ? '0' + myDD : myDD;
								//校验它的下一天，true-说明下一天不是月末--跳出当前循环
								if(this.checkDate(YY + '-' + MM + '-' + myDD + ' 00:00:00') === true){
									continue goDay;
								}
							}else if(this.dayRule === 'workDay'){
								DD = Number(DD);
								let thisDD = DD < 10?'0'+DD:DD;
								//校验并调整如果是2月30号这种日期传进来时需调整至正常月底
								if(this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true){
									while(this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true){
										DD --;
										thisDD = DD < 10?'0'+DD:DD;
									}
								}
								// 获取达到条件的日期是星期X
								let thisWeek = this.formatDate(new Date(YY + '-' + MM + '-' + DD + ' 00:00:00'),'week');
								// 当星期日时
								if(thisWeek === 0){
									//先找下一个日，并判断是否为月底
									DD ++;
									thisDD = DD < 10?'0'+DD:DD;
									//判断下一日已经不是合法日期
									if(this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true){
										DD -= 3;
									}
								}else if(thisWeek === 6){
									//当星期6时只需判断不是1号就可进行操作
									if(this.dayRuleSup !== 1){
										DD --;
									}else{
										DD += 2;
									}
								}
								DD = DD < 10 ? '0' + DD : DD;
							}else if(this.dayRule === 'weekDay'){
							//如果指定了是星期几
								//获取当前日期是属于星期几
								let thisWeek = this.formatDate(new Date(YY + '-' + MM + '-' + DD + ' 00:00:00'),'week');
								//校验当前星期是否在星期池（dayRuleSup）中
								if(Array.indexOf(this.dayRuleSup,thisWeek) < 0){
									continue goDay;
								}
							}else if(this.dayRule === 'assWeek'){
							//如果指定了是第几周的星期几
								//获取每月1号是属于星期几
								let thisWeek = this.formatDate(new Date(YY + '-' + MM + '-' + DD + ' 00:00:00'),'week');
								DD = Number(DD);
								
								console.log(thisWeek,this.dayRuleSup[1])
								if(this.dayRuleSup[1] >= thisWeek){
									DD = (this.dayRuleSup[0]-1)*7 + this.dayRuleSup[1] - thisWeek + 1;
								}else{
									DD = this.dayRuleSup[0]*7 + this.dayRuleSup[1] - thisWeek + 1;
								}
								DD = DD < 10 ? '0' + DD : DD;
							}else if(this.dayRule === 'lastWeek'){
							//如果指定了每月最后一个星期几
								//找到月末最后一天
								DD = Number(DD);
								let thisDD = DD < 10?'0'+DD:DD;
								//校验并调整如果是2月30号这种日期传进来时需调整至正常月底
								if(this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true){
									while(this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true){
										DD --;
										thisDD = DD < 10?'0'+DD:DD;
									}
								}
								//获取月末最后一天是星期几
								let thisWeek = this.formatDate(new Date(YY + '-' + MM + '-' + thisDD + ' 00:00:00'),'week');
								//找到要求中最近的那个星期几
								if(this.dayRuleSup < thisWeek){
									DD -= thisWeek - this.dayRuleSup;
								}else if(this.dayRuleSup > thisWeek){
									DD -= 7 - (this.dayRuleSup - thisWeek)
								}
								DD = DD < 10 ? '0' + DD : DD;
							}
							// 循环“时”数组
							goHour: for(let hi = hhIdx; hi < hhDate.length; hi++) {
								// 判断当前“时”是否超出范围，超出时将时分秒重置并跳出当前日循环
								if(nowHour > hhDate[hhDate.length - 1]) {
									resetSecond();
									resetMin();
									resetHour();
									continue goDay;
								}
								let hh = hhDate[hi] < 10 ? '0' + hhDate[hi] : hhDate[hi]
								// 循环"分"数组
								goMin: for(let mi = mmIdx; mi < mmDate.length; mi++) {
									// 判断当前“分”是否超出范围，超出时将
									if(nowMin > mmDate[mmDate.length - 1]) {
										resetSecond();
										resetMin();
										continue goHour;
									}
									let mm = mmDate[mi] < 10 ? '0' + mmDate[mi] : mmDate[mi];
									// 循环"秒"数组
									goSecond: for(let si = ssIdx; si <= ssDate.length - 1; si++) {
										if(nowSecond > ssDate[ssDate.length - 1]) {
											resetSecond();
											continue goMin;
										}
										let ss = ssDate[si] < 10 ? '0' + ssDate[si] : ssDate[si];
										// 添加当前时间（时间合法性在日期循环时已经判断）
										resultArr.push(YY + '-' + MM + '-' + DD + ' ' + hh + ':' + mm + ':' + ss)
										nums++;
										//如果条数满了就退出循环
										if(nums === 5) break goYear;
										//如果到达最大值时
										if(si === ssDate.length - 1 && mi !== mmDate.length - 1) {
											resetSecond();
											continue goMin;
										} else if(si === ssDate.length - 1 && mi === mmDate.length - 1 && hi !== hhDate.length - 1) {
											resetSecond();
											resetMin();
											continue goHour;
										} else if(si === ssDate.length - 1 && mi === mmDate.length - 1 && hi === hhDate.length - 1 && Di !== DDDate.length - 1) {
											resetSecond();
											resetMin();
											resetHour();
											continue goDay;
										} else if(si === ssDate.length - 1 && mi === mmDate.length - 1 && hi === hhDate.length - 1 && Di === DDDate.length - 1 && Mi !== MMDate.length-1) {
											resetSecond();
											resetMin();
											resetHour();
											resetDay();
											continue goMouth;
										} else if(si === ssDate.length - 1 && mi === mmDate.length - 1 && hi === hhDate.length - 1 && Di === DDDate.length - 1 && Mi === MMDate.length-1 && Yi !== YYDate.length-1) {
											resetSecond();
											resetMin();
											resetHour();
											resetDay();
											resetMouth();
											continue goYear;
										}
									} //goSecond
								} //goMin
							}//goHour
						}//goDay
					}//goMouth
				}
				// 判断100年内的结果条数
				if(resultArr.length === 0){
					this.resultList = ['没有达到条件的结果！'];
				}else{
					this.resultList = resultArr;
					if(resultArr.length !== 5){
						this.resultList.push('最近100年内只有上面'+resultArr.length+'条结果！')
					}
				}
				// 计算完成-显示结果
				this.isShow = true;
			},
			//用于计算某位数字在数组中的索引
			getIndex(arr, value) {
				if(value <= arr[0] || value > arr[arr.length - 1]) {
					return 0;
				} else {
					for(let i = 0; i < arr.length - 1; i++) {
						if(value > arr[i] && value <= arr[i + 1]) {
							return i + 1;
						}
					}
				}
			},
			// 获取"年"数组
			getYearArr(rule, year) {
				this.dateArr[5] = this.getOrderArr(year, year + 100);
				if(rule !== undefined) {
					if(rule.indexOf('-') >= 0) {
						this.dateArr[5] = this.getCycleArr(rule, year + 100, false)
					} else if(rule.indexOf('/') >= 0) {
						this.dateArr[5] = this.getAverageArr(rule, year + 100)
					} else if(rule !== '*') {
						this.dateArr[5] = this.getAssignArr(rule)
					}
				}
			},
			// 获取"月"数组
			getMouthArr(rule) {
				this.dateArr[4] = this.getOrderArr(1, 12);
				if(rule.indexOf('-') >= 0) {
					this.dateArr[4] = this.getCycleArr(rule, 12, false)
				} else if(rule.indexOf('/') >= 0) {
					this.dateArr[4] = this.getAverageArr(rule, 12)
				} else if(rule !== '*') {
					this.dateArr[4] = this.getAssignArr(rule)
				}
			},
			// 获取"日"数组-主要为日期规则
			getWeekArr(rule) {
				//只有当日期规则的两个值均为“”时则表达日期是有选项的
				if(this.dayRule === '' && this.dayRuleSup === ''){
					if(rule.indexOf('-') >= 0) {
						this.dayRule  = 'weekDay';
						this.dayRuleSup = this.getCycleArr(rule, 7, false)
					} else if(rule.indexOf('#') >= 0) {
						this.dayRule  = 'assWeek';
						let matchRule = rule.match(/[0-9]{1}/g);
						this.dayRuleSup = [Number(matchRule[0]),Number(matchRule[1])];
						this.dateArr[3] = [1];
						if(this.dayRuleSup[1] === 7){
							this.dayRuleSup[1] = 0;
						}
					} else if(rule.indexOf('L') >= 0) {
						this.dayRule  = 'lastWeek';
						this.dayRuleSup = Number(rule.match(/[0-9]{1,2}/g)[0]);
						this.dateArr[3] = [31];
						if(this.dayRuleSup === 7){
							this.dayRuleSup = 0;
						}
					} else if(rule !== '*' && rule !== '?') {
						this.dayRule  = 'weekDay';
						this.dayRuleSup = this.getAssignArr(rule)
					}
					//如果weekDay时将7调整为0【week值0即是星期日】
					if(this.dayRule === 'weekDay'){
						for(let i =0; i<this.dayRuleSup.length; i++){
							if(this.dayRuleSup[i] === 7){
								this.dayRuleSup[i] = 0;
							}
						}
					}
				}
			},
			// 获取"日"数组-少量为日期规则
			getDayArr(rule) {
				this.dateArr[3] = this.getOrderArr(1, 31);
				this.dayRule = '';
				this.dayRuleSup = '';
				if(rule.indexOf('-') >= 0) {
					this.dateArr[3] = this.getCycleArr(rule, 31, false)
					this.dayRuleSup = 'null';
				} else if(rule.indexOf('/') >= 0) {
					this.dateArr[3] = this.getAverageArr(rule, 31)
					this.dayRuleSup = 'null';
				} else if(rule.indexOf('W') >= 0) {
					this.dayRule  = 'workDay';
					this.dayRuleSup = Number(rule.match(/[0-9]{1,2}/g)[0]);
					this.dateArr[3] = [this.dayRuleSup];
				} else if( rule.indexOf('L') >= 0 ) {
					this.dayRule = 'lastDay';
					this.dayRuleSup = 'null';
				} else if(rule !== '*' && rule !== '?') {
					this.dateArr[3] = this.getAssignArr(rule)
					this.dayRuleSup = 'null';
				} else if(rule === '*'){
					this.dayRuleSup = 'null';
				}
			},
			// 获取"时"数组
			getHourArr(rule) {
				this.dateArr[2] = this.getOrderArr(0, 23);
				if(rule.indexOf('-') >= 0) {
					this.dateArr[2] = this.getCycleArr(rule, 24, true)
				} else if(rule.indexOf('/') >= 0) {
					this.dateArr[2] = this.getAverageArr(rule, 23)
				} else if(rule !== '*') {
					this.dateArr[2] = this.getAssignArr(rule)
				}
			},
			// 获取"分"数组
			getMinArr(rule) {
				this.dateArr[1] = this.getOrderArr(0, 59);
				if(rule.indexOf('-') >= 0) {
					this.dateArr[1] = this.getCycleArr(rule, 60, true)
				} else if(rule.indexOf('/') >= 0) {
					this.dateArr[1] = this.getAverageArr(rule, 59)
				} else if(rule !== '*') {
					this.dateArr[1] = this.getAssignArr(rule)
				}
			},
			// 获取"秒"数组
			getSecondArr(rule) {
				this.dateArr[0] = this.getOrderArr(0, 59);
				if(rule.indexOf('-') >= 0) {
					this.dateArr[0] = this.getCycleArr(rule, 60, true)
				} else if(rule.indexOf('/') >= 0) {
					this.dateArr[0] = this.getAverageArr(rule, 59)
				} else if(rule !== '*') {
					this.dateArr[0] = this.getAssignArr(rule)
				}
			},
			// 根据传进来的min-max返回一个顺序的数组
			getOrderArr(min, max) {
				let arr = [];
				for(let i = min; i <= max; i++) {
					arr.push(i);
				}
				return arr;
			},
			// 根据规则中指定的零散值返回一个数组
			getAssignArr(rule) {
				let arr = [];
				let assiginArr = rule.split(',');
				for(let i = 0; i < assiginArr.length; i++) {
					arr[i] = Number(assiginArr[i])
				}
				arr.sort(this.compare)
				return arr;
			},
			// 根据一定算术规则计算返回一个数组
			getAverageArr(rule, limit) {
				let arr = [];
				let agArr = rule.split('/');
				let min = Number(agArr[0]);
				let step = Number(agArr[1]);
				while(min <= limit) {
					arr.push(min);
					min += step;
				}
				return arr;
			},
			// 根据规则返回一个具有周期性的数组
			getCycleArr(rule, limit, status) {
				//status--表示是否从0开始（则从1开始）
				let arr = [];
				let cycleArr = rule.split('-');
				let min = Number(cycleArr[0]);
				let max = Number(cycleArr[1]);
				if(min > max) {
					max += limit;
				}
				for(let i = min; i <= max; i++) {
					let add = 0;
					if(status === false && i % limit === 0) {
						add = limit;
					}
					arr.push(Math.round(i % limit + add))
				}
				arr.sort(this.compare)
				return arr;
			},
			//比较数字大小（用于Array.sort）
			compare(value1, value2) {
				if(value2 - value1 > 0) {
					return -1;
				} else {
					return 1;
				}
			},
			// 格式化日期格式如：2017-9-19 18:04:33
			formatDate(value, type) {
				// 计算日期相关值
				let time = typeof value === 'number' ? new Date(value) : value;
				let Y = time.getFullYear();
				let M = time.getMonth() + 1;
				let D = time.getDate();
				let h = time.getHours();
				let m = time.getMinutes();
				let s = time.getSeconds();
				let week = time.getDay();
				// 如果没有传递type值的话返回一个格式化的时间，如果传递type=week的话就返回当前星期几
				if(type === undefined) {
					return Y + '-' + (M < 10 ? '0' + M : M) + '-' + (D < 10 ? '0' + D : D) + ' ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
				}else if(type === 'week') {
					return week;
				}
			},
			// 检查日期是否合法
			checkDate(value) {
				let time = new Date(value);
				let format = this.formatDate(time)
				return value === format ? true : false;
			}
		},
		watch: {
			'ex': 'expressionChange'
		},
		props: ['ex'],
		mounted: function() {
			// 初始化 获取一次结果
			this.expressionChange();
		}
}