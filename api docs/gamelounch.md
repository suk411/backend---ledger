API Calls
Create Player 创建玩家帐号接口
Function Class 接口:	createMember.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/createMember.aspx?operatorcode=xxx&username=xxx&signature=xxx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
username
* Use lowercase
*小写	String 字串	Y 是	Player user name 会员账号

Min Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + username +secret_key), then convert to uppercase 加密后转大写.

Remark 备注: refer to Appendix E QnA, question 1 请参考Appendix附件 E 常见疑问, 问题 1

Get Balance 获取余额接口
Function Class 接口:	getBalance.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/getBalance.aspx?operatorcode=xxx&providercode=xxx&username=xxx&password=xxx&signature=xxx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商号
username
* Use lowercase
* 小写	String 字串	Y 是	Player user name 会员账号

Min
Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
password	String 字串	Y 是	User password 账号密码

Max Length : 12 character 最大长度：12位
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
balance	Double 小数点	Player Balance 所查询游戏账号余额
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + password + providercode + username + secret_key), then convert to uppercase 加密后转大写.

Get Balance Reward Inclusive 获取余额包含奖励接口
Function Class 接口:	getbalance_RewardInclusive.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/getbalance_RewardInclusive.ashx?operatorcode=wecm&providercode=VU&username=uubet8045&password=nL306Nr9984&signature=7A3A512210AD6361E81DB1B56DEB7CCD

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商号
username
* Use lowercase
* 小写	String 字串	Y 是	Player user name 会员账号

Min
Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
password	String 字串	Y 是	User password 账号密码

Max Length : 12 character 最大长度：12位
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Response Body:

{
    "balanceReward" : 54.0,
    "errCode" : "0",
    "balance" : 5515.59,
    "errMsg" : "SUCCESS"
}
Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
balance	Double 小数点	Player Balance 所查询游戏账号余额
balanceReward	Double 小数点	Player Reward Balance 所查询游戏账号奖励余额
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + password + providercode + username + secret_key), then convert to uppercase 加密后转大写.

Remark: this API endpoint only for productCode VU. if u did not take VU, please ignore.

Make Transfer 资金转账接口
Function Class 接口:	makeTransfer.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/makeTransfer.aspx?operatorcode=xxx&providercode=xxx&username=xxx&password=xxx&referenceid=xxx&type=xxx&amount=xxx&signature=xxx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商号
username	String 字串	Y 是	Player user name 会员账号

Min Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
password	String 字串	Y 是	User password 账号密码

Max Length : 12 character 最大长度：12位
referenceid	String 字串	Y 是	Reference ID 转账单据号

Max Length : 20 character 最大长度：20位
type	String 字串	Y 是	1 withdraw 提出
0 deposit 存入
amount	Double小数点	Y 是	Please take note some provider unable to transfer decimal, more info please refer to technical
请留意某些供应商并不支持带小数的转账金额，请咨询技术了解详情

ALWAYS send TRUE VALUE(ratio 1:1) across all currency
所有货币皆以(1:1比率)发送请求
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
innerCode	String 字串	Internal Reference Code 内部参考代码
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(amount + operatorcode + password + providercode + referenceid + type + username + secret_key), then convert to uppercase 加密后转大写.


For transaction with response "errCode":"997" / "errCode":"999", the transaction status is unknown, status could be success/fail
How to handle unknow Make Transfer Response:
1. Verify transaction status
a) Invoke checkTransaction() to confirm the result for the product code that support this API. The product code is not support if get API return "errCode":"92".
b) Verify the transaction status through Provider BO/Provider
c) If the status remains uncertain, escalate the issue to our customer service.

2) Player wallet adjustment based on transaction status response "errCode":"997" / "errCode":"999"
a. Deposit: Deduct the corresponding amount from the player's balance. The corresponding amount should be temporarily withheld from the player's balance, as the transaction status is currently unknown (it may succeed or fail). No adjustment should be made to the player's account until the transaction status is confirmed.
b. Withdrawal: Do not refund the amount to the player until confirmation

对于返回 "errCode":"997" 或 "errCode":"999" 的交易，交易状态为未知，可能成功也可能失败。
处理未知转账响应的方法如下：
1. 验证交易状态
a) 调用 checkTransaction() 接口来确认交易结果（适用于支持此 API 的产品代码）。如果返回 "errCode":"92"，表示该产品代码不支持此 API。
b) 通过供应商后台或供应商渠道核实交易状态。
c) 如果状态仍不明确，请将问题上报至我们的客户服务团队。

2. 根据交易状态响应 "errCode":"997" / "errCode":"999" 对玩家钱包进行调整
a. 存款：从玩家余额中暂时预扣相应金额，因交易状态尚未确定（可能成功或失败）。在收到交易结果确认之前，不得对玩家账户进行任何实际余额调整。
b. 提款：在交易状态未确认前，不可将金额退还给玩家。


⚠️ Special Case
Product Code: JY
The Make Transfer API response may not reflect the final transaction status.

If the response is SUCCESS, treat it as final.
If the response is anything other than SUCCESS , please call the Check TransactionStatus API to obtain the definitive status (wait a few seconds before the 1st status check, recommended: after 10 seconds).
Make Transfer Reward Inclusive 资金转账包含奖励接口
Function Class 接口:	makeTransfer_RewardInclusive.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/makeTransfer_RewardInclusive.ashx?operatorcode=wecm&providercode=VU&username=uubet8045&password=nL306Nr9984&signature=D52F49ECBB98204D4C243F1C2EE6580A&referenceid=test101126082025&type=1&amount=1.1&rewardAmount=2

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商号
username	String 字串	Y 是	Player user name 会员账号

Min Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
password	String 字串	Y 是	User password 账号密码

Max Length : 12 character 最大长度：12位
referenceid	String 字串	Y 是	Reference ID 转账单据号

Max Length : 20 character 最大长度：20位
type	String 字串	Y 是	1 withdraw 提出
0 deposit 存入
amount	Double小数点	Y 是	Please take note some provider unable to transfer decimal, more info please refer to technical
请留意某些供应商并不支持带小数的转账金额，请咨询技术了解详情

ALWAYS send TRUE VALUE(ratio 1:1) across all currency
所有货币皆以(1:1比率)发送请求
rewardAmount	Double小数点	Y 是	Please take note some provider unable to transfer decimal, more info please refer to technical
请留意某些供应商并不支持带小数的转账金额，请咨询技术了解详情

ALWAYS send TRUE VALUE(ratio 1:1) across all currency
所有货币皆以(1:1比率)发送请求
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
innerCode	String 字串	Internal Reference Code 内部参考代码
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(amount + operatorcode + password + providercode + referenceid + type + username + secret_key), then convert to uppercase 加密后转大写.


Remark: this API endpoint only for productCode VU. if u did not take VU, please ignore

Launch Games 启动游戏接口
Function Class 接口:	launchGames.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/launchGames.aspx?operatorcode=xxx&providercode=xxx&username=xxx&password=xxx&type=xxx&gameid=xxx&lang=xxx&html5=xxx&signature=xxx&blimit=xx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商号

* Provider Code below please refer to Appendix E
1) S2
2) P3
username
* Use lowercase
* 小写	String 字串	Y 是	Player user name 会员账号

Min Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
password	String 字串	Y 是	User password 账号密码

Max Length : 12 character 最大长度：12位
type	String 字串	Y 是	Please refer to
1. Game Type Code for the categories
For example: SL = slot

and
2. SUPPORTED GAME TYPE CODE in Provider Code table 各自供应商所支持的游戏类型
For example: GS only support SL games
Different game types may share the same lobby. However, for reporting purposes, additional game types are defined to categorize the data according to the provider's classification.
gameid	String 字串	N 否	Game ID
游戏代号

Ignore this field/0 will go to game lobby
可以忽略此参数，预设为‘0’即可直接进入相关游戏厅
lang	String 字串	N 否	Language code must follow the ISO 639-1 standard (2-letter language code) combined with the ISO 3166-1 alpha-2 standard (2-letter country code), forming a 4-character code (e.g., en-US, zh-CN, vi-VN).
语言代码必须遵循 ISO 639-1 标准（2 位字母语言代码），并与 ISO 3166-1 alpha-2 标准（2 位字母国家代码）结合，形成 4 个字符的代码（例如：en-US、zh-CN、vi-VN）。
html5	String 字串	N 否	html5=0, for flash(not mobile friendly)
html5=1, for html5(mobile friendly)
html5=0, 使用flash;
html5=1, 使用html5(手机优化页面)
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
blimit	String 字串	N 否	Bet limit id/group (currently only support product/provider code GA,AG,GE)
投注限额 id/group (目前只有GA,AG,GE 供应商号能使用)
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
gameUrl	String 字串	Launch Game Url 游戏链接
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + password + providercode + type + username + secret_key), then convert to uppercase 加密后转大写.

Launch DEMO Games 启动试玩游戏接口
Function Class 接口:	launchDGames.ashx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/launchDGames.ashx?providercode=xxx&type=xxx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商号
type	String 字串	Y 是	Please refer to Game Type Code Below
请参考附录{游戏类型}列表
gameid	String 字串	N 否	Game ID
游戏代号

Ignore this field/0 will go to game lobby
可以忽略此参数，预设为‘0’即可直接进入相关游戏厅
lang	String 字串	N 否	ISO 639-1, default language en-US
ISO 639-1, 默认语言为en-US
html5	String 字串	N 否	html5=1, for html5(mobile friendly)
html5=1, 使用html5(手机优化页面)
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
gameUrl	String 字串	Launch Game Url 游戏链接
errMsg	String 字串	Error Message 报错内容
Remark 备注:

Product Code	Launch with GameID	Demo Lobby	Lobby with Real and Demo Play	Remark
PR	Yes	No	Yes	(Only Slot Game support Demo Play)
Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
P6	Yes	No	Yes	(Only Slot Game support Demo Play)
Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
JJ	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
G8	Yes	No	Yes	(Only Slot and Lottery Game support Demo Play)
Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
GP	Yes	No	Yes	(Only Slot and Lottery Game support Demo Play)
Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
JK	Yes	No	No	Require gameid
JO	Yes	No	No	Require gameid
MH	Yes	No	No	Require gameid
FK	No	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Demo Game Url can get from API Get Game List.
Fields 参数 reformatJson = no
Demo Game Url will be "demoGameUrl"
Fields 参数 reformatJson = yes
Demo Game Url will be "g_code_fun_h5"
QT	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
PS	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
SG	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
JD	Yes	Yes	No	Function Class 接口: launchDGames.ashx
If gameid 0 or empty will go to Demo Lobby
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
HB	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
AN	No	Yes	No	Function Class 接口: launchDGames.ashx
If gameid 0 or empty will go to Demo Lobby
OC	No	Yes	No	Function Class 接口: launchDGames.ashx
If gameid 0 or empty will go to Demo Lobby
FB	No	Yes	No	Function Class 接口: launchDGames.ashx
If gameid 0 or empty will go to Demo Lobby
WW	No	Yes	No	Function Class 接口: launchDGames.ashx
If gameid 0 or empty will go to Demo Lobby
RL	No	Yes	No	Function Class 接口: launchDGames.ashx
If gameid 0 or empty will go to Demo Lobby
BD	Yes	Yes	No	Function Class 接口: launchDGames.ashx
If gameid 0 or empty will go to Demo Lobby
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
FC	Yes	Yes	No	Function Class 接口: launchDGames.ashx
If gameid 0 or empty will go to Demo Lobby
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
EC	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
US	Yes	Yes	No	Function Class 接口: launchDGames.ashx
If gameid 0 or empty will go to Demo Lobby
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
L1	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
DT	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
E5	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
DS	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
OS	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
FG	Yes	No	Yes	Function Class 接口: launchGames.aspx
If gameid 0 or empty will go to Lobby (Lobby will have Launch Demo Button)
Function Class 接口: launchDGames.ashx
Require direct Launch Game with GameID
Update Player Password 更新玩家密码接口
Function Class 接口:	changePassword.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/changePassword.aspx?operatorcode=xxx&providercode=xxx&username=xxx&password=xxx&opassword=xxx&signature=xxx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商号
username	String 字串	Y 是	Player user name 会员账号

Min Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
password	String 字串	Y 是	New user password 新账号密码

Max Length : 12 character 最大长度：12位
opassword	String 字串	Y 是	Old user password 旧账号密码

Max Length : 12 character 最大长度：12位
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(opassword + operatorcode + password + providercode + username + secret_key), then convert to uppercase 加密后转大写.

Check Agent Credit (KIOSK BALANCE) 查询代理余额接口 (集成系统余额)
Function Class 接口:	checkAgentCredit.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/checkAgentCredit.aspx?operatorcode=xxx&signature=xxx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
data	Double 小数点	KIOSK BALANCE集成系统最新代理余额
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + secret_key), then convert to uppercase 加密后转大写.

Check Product Username 查询玩家游戏平台帐号接口
Function Class 接口:	checkMemberProductUsername.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/checkMemberProductUsername.ashx?operatorcode=xxx&providercode=xxx&username=xxx&signature=xxx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商号
username	String 字串	Y 是	Player user name 会员账号

Min Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
data	String 字串	Product Username 玩家游戏平台账号
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + providercode + username + secret_key), then convert to uppercase 加密后转大写.

*make sure getBalance() is success first before using this API endpoint.

Launch DeepLink App (beta) 深层链接
Function Class 接口:	launchAPP.ashx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/launchAPP.ashx?operatorcode=xxx&providercode=JK&username=xxx&password=xxx&signature=xxx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商代号
username	String 字串	Y 是	Player user name 会员账号

Min Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
password	String 字串	Y 是	
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
gameUrl	String 字串	Deeplink url
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + providercode + secret_key), then convert to uppercase 加密后转大写.

Check TransactionStatus
Function Class 接口:	checkTransaction.ashx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<LOG_URL>/checkTransaction.ashx?operatorcode=xxxxreferenceid=10842293&signature=5603493CC36D59064E432B83BBDEC4F7

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
referenceid	String 字串	Y 是	Referenceid used at makeTransfer 资金转账接口所用的referenceid
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

errCode	String 字串	Error Code of this API request(for full Error Code please refer at Appendix) 报错码
data	String 字串	{
"trans_id": "39861348",
"trans_time": "2021-04-01T05:14:23.63",
"username": "josh1212",
"type": "1",
"provider": "WB",
"amount": 500.1,
"ref_id": "10842293",
"status": "FAILED",
"operator": "m777",
"remark": ""
}
trans_id	GSC generated transID
trans_time	Time of this transaction, GMT+0
username	Playername of this transaction
type	Transaction type
0 = deposit
1= withdrawal
provider	Provider of this transaction
amount	Amount of this transaction
ref_id	Operator’s ReferenceID used at maketransfer.API
status	Status of this transactionID 此单号的转账状态。

SUCCESS 成功
PROCESSING 进行中，请稍后再确认
FAILED 失败
operator	GSC opcode, operatorcode of this transaction
remark	transaction remarks (if any)
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + secret_key), then convert to uppercase 加密后转大写.

Supported product code（目前支持的产品）: WB, AG, CF, SU, PG ,SO, WC, RE, DG, GE, JK, GB, PR, IB, TF, S2, IA, MP, HB, AT, BL, UG, M8

Get Betting History *standardized/固定
Function Class 接口:	fetchbykey.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<LOG_URL>/fetchbykey.aspx?operatorcode=xxx&versionkey=0&signature=D653B0F33F893D6F327DD7BB9D8DDAAA

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
versionkey	String 字串	Y 是	please always use versionkey=0
请使用versionkey=0
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
result	String 字串	Json string (betting history record)
Json字符串格式(投注历史记录)

refer Appendix C for attribute
详细的回传参数说明请参阅 Appendix附件C
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + secret_key), then convert to uppercase 加密后转大写.

Remark 1 备注 1:
Per call will get 300 latest betting records, if without mark, same 300 records will be given.
每次的呼叫将获得300个最新的投注记录，如果没有进行标记，将拿到相同的300个记录。

Remark 2 备注 2:
Please UPDATE records for same ID.
请更新相同ID的记录

Remark 3 备注 3:
Product Code that do not have bet report
KS,ME,L2,PU
没有投注报告的供应商代号
KS,ME,L2,PU

Remark 4 备注 4:
Time interval to fetch report is recommended set to 1 minute
获取报告的时间间隔建议设置为1分钟

Get Daily History
Function Class 接口:	getDailyWager.ashx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<LOG_URL>/getDailyWager.ashx?operatorcode=ccjr&dateF=2023-11-10&dateT=2023-11-17&providercode=ME&signature=B8741F7BA059214DE320DDF4B528665CA

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
dateF	String 字串	Y 是	from date, YYYY-MM-DD
dateT	String 字串	Y 是	to date, YYYY-MM-DD
providercode	String 字串	Y 是	Provider code 供应商号
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
result	String 字串	Json string (betting history record)
Json字符串格式(投注历史记录)
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + secret_key), then convert to uppercase 加密后转大写.

Remark 1 备注 1:
for each API request, maximum allowed date range is 7 days
每次API 最长只能查询 7 天

Remark 2 备注 2:
Supported product code（目前支持的产品）: G5, G7, KS, JK, RE, ME, PR, PV, P6, PU, RS, SG, T9, TU

Remark 3 备注 3:
The GetDailyWager API (dateF, dateT, API response) operates based on the Game Provider's time zone.
GetDailyWager API (dateF, dateT, API response ) 是根据游戏厂商的时区。

providercode Time Zone
G5 GMT+8
G7 GMT+8
KS GMT+8
JK GMT+8
RE GMT+8
ME GMT+8
PR GMT+0
PV GMT+0
P6 GMT+8
PU GMT+8
RS GMT+8
SG GMT+8
T9 GMT+8
TU GMT+8

Remark 4 备注 4:
Daily summary reports are only generated after the day ends (based on the Game Provider's time zone), so data will not be available until the following day.
每日汇总报表仅在该日（基于游戏厂商时区）结束后生成，因此数据需等到次日方可获取。

Get Betting History_Archieve 捞取投注历史记录接口(fetchArchieve以版本号捞取)
Function Class 接口:	fetchArchieve.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<LOG_URL>/fetchArchieve.aspx?operatorcode=xxxx&versionkey=0&signature=D653B0F33F893D6F327DD7BB9D8DDAAA

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
versionkey	String 字串	Y 是	please always use versionkey=0
请使用versionkey=0
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
result	String 字串	Json string (betting history record)
Json字符串格式(投注历史记录)

refer Appendix C for attribute
详细的回传参数说明请参阅 Appendix附件C
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + secret_key), then convert to uppercase 加密后转大写.

Remark 备注:
this function is used for grab betdata that is archived. 此接口用来获取备用档案。

Mark Betting History 标记投注历史记录接口(mark标记)
Function Class 接口:	markbyjson.aspx
Request 请求类型:	POST
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<LOG_URL>/markbyjson.aspx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
ticket	String 字串	Y 是	Ticket id get in Get Betting History(fetchbykey). Pass in format eg. 1,2,3,4,5,6,7,8

捞取投注历史记录接口(以版本号捞取) 回传的Ticket id 传入格式 ，例如：1,2,3,4,5,6,7,
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Method: POST
URL: <LOG_URL>/markbyjson.ashx
Body:

{
    "ticket" : "1,2,3,4,5,6,7,8",
    "operatorcode" : "xxxx",
    "signature" : "xxxxxxxxxxx"
}
Response Body

{
    "errCode" : "0",
    "errMsg" : "SUCCESS"
}
Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + secret_key), then convert to uppercase 加密后转大写.

Mark Betting History_Archieve 标记投注历史记录接口(mark标记)
Function Class 接口:	markArchieve.ashx
Request 请求类型:	POST
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<LOG_URL>/markArchieve.ashx?operatorcode=xxx&ticket=xxx&signature=xxx

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
ticket	String 字串	Y 是	Ticket id get in Get Betting History(fetchbykey). Pass in format eg. 1,2,3,4,5,6,7,8

捞取投注历史记录接口(以版本号捞取) 回传的Ticket id 传入格式 ，例如：1,2,3,4,5,6,7,
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Method: POST
URL: <LOG_URL>/markArchieve.ashx
Body:

{
    "operatorcode" : "xxxx",
    "signature" : "xxxxxxxxxxx"
    "ticket" : "4098362429,1010,2040"
}
Response Body:

{
    "errCode" : "0",
    "errMsg" : "SUCCESS"
}
Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + secret_key), then convert to uppercase 加密后转大写.

Get Game List 获取游戏列表
Function Class 接口:	getGameList.aspx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/getGameList.ashx?operatorcode=dcmm&providercode=GP&lang=en&html=0&reformatjson=yes&signature=F92ED5A3066B4AB6BFF54970D135D1AE

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商代号
Lang	String 字串	N 否	ISO 639-1, default language en-US
ISO 639-1, 默认语言为en-US

*default:en
*attribute not fully established
html5	String 字串	N 否	html5=1, for html5(mobile friendly)
html5=1, 使用html5(手机优化页面)

*default:all type
*attribute not fully established
reformatJson	String 字串	N 否	yes = GSC standardized gamelist pattern
no= providercode custom gamelist pattern
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
gamelist	String 字串	Gamelist 游戏列表
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode.toLower() + providercode.toUpper() + secret_key), then convert to uppercase 加密后转大写.

Remark:
If receive
{
   "errCode": "-997",
   "errMsg": "Invalid Param: getGameList function with param {...} is not ready for {product code}"
}
This means the product is not supported or not yet available.
Should you experience any issues or have any concerns, kindly contact the support team.

Kick Player 踢出玩家接口
Function Class 接口:	kickPlayerFromProduct.ashx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/kickPlayerFromProduct.ashx?operatorcode=dcmm&providercode=JD&username=gamingsoft&password=123&signature=F92ED5A3066B4AB6BFF54970D135D1AE

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商代号
username	String 字串	Y 是	Player user name 会员账号

Min Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
password	String 字串	Y 是	User password 账号密码
Max Length : 12 character 最大长度：12位
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + password + providercode + username + secret_key), then convert to uppercase 加密后转大写.

Remark 备注:
currently only support provider code JD 目前仅支持供应商代号JD.

Is Player In Game 玩家是否在游戏中接口
Function Class 接口:	isPlayerIngame.ashx
Request 请求类型:	GET
Response 回传格式:	application/json
Input Data Type 请求资料型态

Example 范例:
<API_URL>/isPlayerIngame.ashx?operatorcode=dcmm&providercode=JD&username=gamingsoft&password=123&signature=F92ED5A3066B4AB6BFF54970D135D1AE

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
operatorcode	String 字串	Y 是	Operator code 代理号
providercode	String 字串	Y 是	Provider code 供应商代号
username	String 字串	Y 是	Player user name 会员账号

Min Length : 3 character 最短长度：3位
Max Length : 12 character 最大长度：12位
password	String 字串	Y 是	User password 账号密码
Max Length : 12 character 最大长度：12位
signature	String 字串	Y 是	MD5 encryption string MD5 加密字符串
Response Data Type 回传资料型态

Fields 参数	Type 资料型态	Description 参数说明
errCode	String 字串	Error Code 报错码
result	String 字串	is this player still in game 玩家是否在游戏。

false 不在游戏
true 游戏中
errMsg	String 字串	Error Message 报错内容
Signature Formula 加密字符串:
Signature = MD5(operatorcode + password + providercode + username + secret_key), then convert to uppercase 加密后转大写.

Remark 备注:
currently only support provider code JD 目前仅支持供应商代号JD.

Game Type Code 游戏类型列表
Code 代号	Description 游戏类型说明
CB	CARD & BOARDGAME 棋牌游戏
ES	E-GAMES 电子游戏
SB	SPORTBOOK 体育游戏
LC	LIVE-CASINO 真人视讯游戏
SL	SLOTS 老虎机游戏
LK	LOTTO 彩票游戏
FH	FISH HUNTER 捕鱼游戏
PK	POKER 扑克游戏
MG	MINI GAME 迷你游戏
OT	OTHERS 其他游戏
Provider Code 供应商列表
Provider Code 供应商代号	Description 供应商说明	Supported Game Type Code 支持的游戏类型
AC	ACE333	SL
AD	ADVANT PLAY	SL
AF	AFB SPORT	SB
AG	PLAYACE	FH,LC,SL
AJ	MD998V2_ACE333	SL
AK	ALLBET	LC
AM	AMEBA	SL
AN	AFB GAMING	FH,SL
AR	GAME ART	LC,SL
AT	ALLBET2.0	LC
AU	MD998V2_ABS4D	LK
AW	ACEWIN	FH,SL
AY	MD998V2_SS-sports	SB
AZ	ABS4D/ACE333/S-SPORTS	LK,SB,SL
BA	ALL IN OPTION	OT
BC	BC_SPORT	SB
BG	BINGO	LK
BH	Baison百胜棋牌	CB,FH
BI	BIG GAMING	FH,LC,LK,SL
BJ	BETTER GAMING	SL
BK	ICONIC21	LC
BL	BOLE GAMING	CB,OT,SL
BP	AP GAMING	ES,SB
BQ	BINGO	LK
BR	BINGO	LK
BU	BGaming	OT,SL
BY	BT GAMING	CB,FH,PK,SL
C1	AMB_PGSOFT	SL
CE	93CONNECT	LK,OT,SL
CG	CREATIVE GAMING	SL
CJ	CR体育	SB
CM	CMD SPORTSBOOK	SB
CN	CROCO GAMING	SL
CQ	CQ9	FH,OT,SL
CU	CROWDPLAY	SL
CV	CMD VIRTUAL SPORTSBOOK	SB
CX	AFB CASINO	LC
CY	AWC RCB988	OT
CZ	CROWDPLAY	SL
D0	DS88	OT
DB	9Dragon2d3d	
DE	DISCOVERY GAMING帝駒棋牌	
DF	大富翁	
DG	DREAM GAMING	LC
DL	28WIN	LK
DM	DIGMAAN	OT
DO	DIRECT SBO	LC,SB,SL
DS	DRAGOON SOFT	FH,SL
DT	LGD GAMING	SL
DV	DISCOVERY GAMING	
DX	SabaPlay	
DZ	DIGITAIN	SB
E5	EASY GAMING	SL
E6	EVO888	SL
EA	EA Game	LC
EK	GSeSport	ES
EN	ENDORPHINA	SL
EP	EVOPLAY	SL
EX	EXPANSE	LC,LK,OT,PK,SB,SL
EZ	EZUGI	LC
F7	FLOWGAMING_BLUEPRINT	SL
FA	OFA Live Casino	LC
FB	FB SPORT	SB
FC	FA CHAI(FC)	FH,OT,SL
FI	FLOWGAMING	SL
FK	FUNKYGAME	FH,LK,OT,SL
FR	PLAYTECH	LC,SL
FS	FASTSPIN	FH,SL
G2	GAMINGSOFT 7E SUNCITY	
G4	GFG	CB,FH,SL
G5	5G	SL
G7	5G	SL
G8	GAMEPLAY	LC,LK,SL
G9	GAMINGSOFT TANGKAS	LK
GB	BBIN	FH,LC,LK,SB,SL
GC	GLCSOFT	SL
GE	EVOLUTION/NLC/BTG/NETENT/RED TIGER	LC,SL
GF	GAMINGSOFT 7E KENZO	
GH	GAMINGSOFT 7E PLAYGIRL	
GK	GAMINGSOFT 7E 918KISS	
GP	GAMEPLAY	LC,LK,SL
GQ	GAMINGSOFT 7E GCLUB	
GV	GAMINGSOFT 7E MEGA888	
GW	GAMINGSOFT 7E GREATWALL	
GY	GAMINGSOFT 7E PLAYBOY	
GZ	GAMINGSOFT 7E NEWTOWN	
H2	GB SLOT/GB 电子	SL
H5	888KING(H5)	SL
HB	HABANERO	SL
HC	GB电竞	OT
HG	HOGAMING	LC,SL
HR	HAPPY RACE RUMMY	
HS	HS4D	LK
HW	HUAWEI88	LK
HY	HYDAKO	SL
I1	AI GAMING	SL
I2	AI GAMING	SL
I5	IBEX	SL
I9	IBEX	SL
IA	IA ESPORT小艾电竞	ES
IB	IBC	ES,SB
IE	小艾电竞 IA ESPORT[Common Wallet]	ES
IG	IGLOTTO	LK
IK	AMIGO	
IM	IM SPORTBOOK / IMONE	ES,SB
IN	INCENTIVE GAME	
IS	ISIN4D	LK
JB	金霸	OT
JD	JDB	FH,OT,SL
JE	JILI DIRECT	CB,FH,LC,OT,SL
JK	JOKER	FH,OT,SL
JM	JDB-Stream	SL
K1	918KAYA	SL
K5	KING855(KING99)	LC
K9	KING855	LC
KB	888 KING	
KG	KG棋牌	
KN	888King H5	SL
KQ	KY体育	SB
KW	28WIN(KING99)	LK
KY	KAIYUAN GAMING 开元棋牌	CB
L1	LIVE22 SLOTMAKER	SL
L2	LIVE22	
L6	LUCKY365	LC,SL
L7	LG幸运棋牌	PK
L8	EEAI(LUCKOAI)	LC
L9	97 LOTTO	LK
LB	LUCKYSPORT	SB
LC	LONG CHENG	CB
LF	LFC	FH,SL
LG	LEGAMING乐游棋牌	CB
LI	LIVE GAMING	
LN	LION KING	OT,SL
LO	TY LOTTO (GS LOTTO)	LK
LS	LUCKYSTREAK	LC
LV	LIVE VIDEO	OT
M0	MP POKER	CB,OT
M2	MANCALA GAMING	SL
M5	MEGAH5	SL
M6	M365	SL
M8	M9BET	SB
M9	MEGAWIN	SL
MA	MARK 6 LOTTO	LK
MB	MT POKER	CB,FH,LC,SL
MD	MIKIWORLD NEW	CB
ME	MEGA888	FH,SL
MG	MICRO GAMING	FH,LC,SL
MO	MUCHO ORIENTAL GAMING	LC
MP	MICRO GAMING PLUS	FH,LC,SL
MW	MIKIWORLD	CB
MX	maxproMG	CB,FH,LC,LK,OT,PK,SL
N1	NAGA GAMES	SL
N4	PERDANA 4D	LK
ND	NEX4D	LK,OT
NK	NETPLAY PUSSY888	SL
NP	NW POKER	CB
NS	NEXTSPIN	SL
NT	NETENT	SL
O1	DB PANDA SPORTS	SB
O2	DB LIVE CASINO	LC
O3	DB POKER	CB,OT
O4	DBGAMING BOYA QIPAI	CB
O5	DB SLOTS	SL
O6	DB ESPORT	ES
O7	DB FISHING(O7)	FH
O8	ON POKER	PK
O9	ORIENTAL GAMING	LC,SL
OC	ON CASINO	LC
OD	ATG GAMES	SL
OK	ONSPORT	SB
OL	ON LOTTO	LK
OM	AskMeLotto	LK
OO	OBET33	
OZ	ACE333	SL
P2	SKYWIND	LC,SL
P5	58 POKER	PK
PB	PLAY8OY	SL
PG	PGSOFT	SL
PH	PGSOFT	SL
PJ	PEGASUS	SL
PM	PRETTY GAMING	LC
PN	PLAY N GO	SL
PO	Playstar(Stream)	FH,SL
PR	PRAGMATIC	LC,OT,SB,SL
PS	PLAYSTAR	OT,SL
PV	PRAGMATIC PHP(PV)	LC,OT,SB,SL,VS
PZ	PLAYTECH	LC,SL
Q0	GX CRICKET	SB
Q5	AI LIVE CASINO	LC,OT
Q6	PLAYTECH	LC,SL
Q7	ACEWINNEW-OWN	SL
Q8	GX WICKETS	SB
QC	GAMING PANDA	SL
QD	PLAYBOY	SL
QF	AWC SEXY BACCARAT(QF)	LC
QI	PUSSY888	FH,OT,SL
QK	QQ KENO	LK
QT	QTECH	SL
R0	1SLOT	SL
R3	赢马	SB
R4	PLAYTECH	LC,SL
R8	RICH88	OT,SL
RA	DRAGON GAMING	SL
RE	KINGMIDAS	SL
RG	RTG GAMING	SL
RL	AI LIVE CASINO	LC,OT
RO	ROYAL CASINO GAMING	LC
RS	ROYAL SLOT GAMING	FH,SL
S3	SBO	SB
S4	SA GAMING	LC
S5	[Common Wallet] SBO	
S6	AWC68	FH,LC,OT,SL
S9	GGSoft	OT
SA	SAGAMING	LC
SB	SBTECH SPORTSBOOK-BTI	CG,FG,SB
SG	SPADE GAMING	FH,SL
SK	SUPER SPORT	SB
SL	Siam Lotto (SLotto)	LK
SP	SUPERSPORT(SP)	SB
SQ	SUPERLOTTO	LK
ST	3SING	SB
SU	SUPER SPADE GAMES	LC
SY	SIMPLE PLAY	FH,SL
T0	MEGA888H5-2.0	SL
T4	Slot4D	SL
T5	WINSLOT	SL
T6	EpicWin-Own Provider	SL
T7	28WIN(vboss)	LK
T9	T9 主播百家樂	LC
TA	T1GAMES	OT
TC	TCG LOTTO	LK
TD	TADA	CB,FH,OT,SL
TE	28WIN	LK
TF	TFGAMING	ES,SB
TG	TCG SEA LOTTO	LK
TH	天豪棋牌	CB
TP	TOP PLAYER SLOT	CB,FH,LC,LK,SL
TV	TCG VN LOTTO	LK
U0	MetaGaming-PROMOTION LINE	SL
U1	CRASHBANG(U1)	OT,SL
U2	SCR888-PROMO LINE	
U3	AFRICAN BUFFALO	SL
U4	INOUT	SL
U5	NOWSPORTS	SB
U6	MT LIVE	LC
U7	Meta Gaming(U7)	SL
UF	UFA SPORTBOOK	SB
UG	UG SPORT	SB
US	UU Slots	SL
V8	V8POKER	CB
VA	VIA CASINO	LC
VG	VG	CB
VN	VEGAS LOUNGE	LC
VP	V-POWER	FH,SL
VT	VIRTUAL TECH	SL
VU	LUCKY365	SL
VW	LUCKY365	SL
W0	WG Lotto	LK
W2	TWOWIN	FH,LK,OT,SL
WB	WBET	SB,TN
WC	WM CASINO	LC
WG	王牌	
WH	WF GAMING	SL
WI	9WICKETS	SB,SL
WJ	2J	SL
WK	9WICKET	SB,SL
WM	WORLDMATCH	FH,SL
WN	WON CASINO	LC
WP	WG體育	SB
WS	WS SPORTS萬昇体育	SB
WW	WOW GAMING(WW)	CB,PK,SL
X1	XSolution	
X2	X2 PGSOFT THB	SL
X4	XE88	SL
XA	XIN BAO鑫寶体育	SB
XO	SLOTXO	SL
XP	XPG/BETSOFT	LC,SL
YB	YEEBET	LC
YD	YGGDRASIL	SL
YL	YLGAMING	FH,SL
YR	YESGETRICH	SL
YZ	ACEWIN	SL
ZB	FGG	LC
Remark 备注:
Provider Code: WI, WK
The API for launching games using SB is sufficient. Other game types are categorized for reporting purposes as per the provider's classification.

Error Code 报错码列表
Error Code 报错码	Description 报错说明
0	SUCCESS 请求成功
61	CURRENCY_NOT_SUPPORT 货币不兼容
70	INSUFFICIENT_KIOSK_BALANCE 集成系统余额不足
71	INVALID_REFERENCE_ID 单据号不正确
72	INSUFFICIENT_BALANCE 余额不足
73	INVALID_TRANSFER_AMOUNT 转账金额不正确
74	INVALID_TRANSFER_AMOUNT_TWO_DECIMAL_ONLY 转账金额不能多过两个小数点 0.00
75	NOT_ALLOW_TO_MAKE_TRANSFER_WHILE_IN_GAME 不允许在游戏中进行转移
81	MEMBER_NOT_FOUND 会员账号不存在
82	MEMBER_EXISTED 会员账号已存在
83	OPERATOR_EXISTED 代理号已存在
90	INVALID_PARAMETER 请求参数不正确
91	INVALID_OPERATOR 代理号不正确
92	INVALID_PROVIDERCODE 供应商代号不正确
93	INVALID_PARAMETER_TYPE 请求参数类型不正确
94	INVALID_PARAMETER_USERNAME 账号不正确
95	INVALID_PARAMETER_PASSWORD 密码不正确
96	INVALID_PARAMETER_OPASSWORD 旧密码不正确
97	INVALID_PARAMETER_EMPTY_DOMAINNAME 请求链接/域名不正确
98	INVALID_USERNAME_OR_PASSWORD 账号/密码错误
99	INVALID_SIGNATURE 加密错误
600	pre-check stage FAILED, deposit/withdraw transaction IGNORED 前期检验失败。 存款/取款 操作已被无视
601	DEPO_APIREQ_BLOCKED_FOR_THIS_PRODUCT_TILL_FURTHER_NOTICE 此产品的存款 功能暂时停用维修
602	WITH_APIREQ_BLOCKED_FOR_THIS_PRODUCT_TILL_FURTHER_NOTICE 此产品的取款 功能暂时停用维修
603	Going to perform an online maintenance, Deposit/Withdraw API is DISABLED temporarily (disabled duration 5~ 10 minutes, will release earlier when done earlier). 即将执行在线系统维护，为了避免维护时导致的系统不稳定，转账API暂时停止（暂停时间大约5～10分钟，若提早完毕会提早解放）
992	INVALID_PARAMETER_PRODUCT_NOT_SUPPORTED_GAMETYPE 平台不兼容请求的游戏类型
991	OPERATOR_STATUS_INACTIVE 代理号已冻结
994	ACCESS_PROHIBITED 接口访问被禁止
995	PRODUCT_NOT_ACTIVATED 平台未开通
996	PRODUCT_NOT_AVAILABLE 平台不支持
998	PLEASE_CONTACT_CSD 请联系客服
999	UNDER_MAINTENENCE 系统维护中
9999	UNKNOWN_ERROR 未知错误
-987	RECORD_NOT_FOUND 交易单号不存在；产品不支持
-997	SYS_EXCEPTION, Please contact CS. 系统错误，请联络客服。
-998	INSUFFICIENT_APIKIOSK_BALANCE 集成系统接口余额不足
-999	API_ERROR 接口错误
Service URL 接口链接
For API related API ONLY (DO NOT USE this when getting bet report)
调用端:	<API_URL>
For Report/betting history related
捞取投历史记录端:	<LOG_URL>
Appendix 附件
A - Special request on bet history / 投注记录的特殊接口请求
Product code 供应商代号: PG

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
versionkey	String 字串	N 否	For pgsoft, there are two type
PGSoft支持两种类型
- C_ + {versionkey} (cash/现金)
- T_ + {versionkey} (tournament/红利)
Product code 供应商代号: FG

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
type	String 字串	N 否	For fungaming, there are four type
Fun Gaming支持四种类型
- fish
- fruit
- poker
- slot
Product code 供应商代号: BI

Fields 参数	Type 资料型态	Req 必要	Description 参数说明
type	String 字串	N 否	For Big Gaming, there are four type
Big Gaming 支持四种类型
- FH
- LK
- LC
- SL
Product code 供应商代号: IG

//Remark 备注:
//How to generate value for etc 如何制作etc参数?
//Answer 答案:
//extra_parameter_HK (in json):
{
"gamenoid":"1",
"beginid":"0",
}

//extra_parameter_SC (in json):
{
"gamenoid":"1",
"beginid":"0",
"reportdateid":"0"
}

urlencode(base64encode(extra_parameter))
Fields 参数	Type 资料型态	Req 必要	Description 参数说明
type	String 字串	N 否	For IG Lotto, there are two type
IG Lotto 支持两种类型
- SC 时时彩
- HK 香港彩
etc	String 字串		
B - Callback related / 回调网址解说
Code sample 代码样本:

//get the data in query parameter from AIO 接收并解析集成系统传送的数据串
string username = context.Request.QueryString["username"];
string password = context.Request.QueryString["password"];
string provider = context.Request.QueryString["provider"];
string resp = “false”;

//process and check the data from AIO 核实与处理
//check the member exist 检查玩家帐号是否存在
//check the password is correct 检查玩家登入密码是否正确
//checking C 检查项目C
//checking D 检查项目D
If(valid)
{ resp = “true”;}
Else
{ resp = “false”;}

//return message to AIO回传至集成系统的响应内容
context.Response.Write(resp);
AIO will send request to below file, your side will need to process the data and send a response to AIO.
集成系统将发送请求至以下文档，贵方需自行核实，处理该数据内容，并回传一个(成功/失败)响应给集成系统。

Normally only Provider code that have/use APP will need this.
一般支持手机应用APP的供应商会需要预设此回调。

Function Class接口: Not Applicable
Request 请求类型 : GET
Response 回传格式 : text/html; charset=utf-8

Example 范例:
Request 请求:
AIO will send data to the callback url (your side), process it.
集成系统将发送验证请求至贵司的回调网址，贵司系统接收后需要进行必要的处理。

Callback request sample 回调请求例子：
http://apiclient_path/ch3ckM3mb3r.ashx?username=jordan&password=123456&provider=1S

Response 回传:
After process, return the result to AIO. 处理并核实完成后，请响应以下内容至集成系统。
“false”

 Please remember to provide this callback url to AIO team, for further integration purpose
请提供回调网址给集成系统团队，以便进一步的对接进行使用
http://apiclient_path/ch3ckM3mb3r.ashx

Remark 备注:
Currently the below provider are advised to prepare this method.
若有申请以下供应商的游戏平台，请按照步骤并开发这个程序

CS
GP
ME
N2
XP
SA
L4
VT
GS
SG
AC
NS
CV
CG
N1
PG
G5
C - Standardized betting history attribute / 固定式投注历史记录回传参数
 Attributes are fixed and will not change according to provider code
回传参数内容将保持不变
Fields 参数	Type 资料型态	Req 必要	Description 参数说明
id	Int 整数字	Y是	AIO Bet id (unique) AIO 注单号 (唯一值)
ref_no	Int 整数字	Y是	Provider Bet id 供应商注单号
site	String字串	Y是	Provider code 供应商代号
product	String字串	Y是	Game type code 游戏类型代号
member	String字串	Y是	Username 玩家帐号
game_id	String字串	Y是	Game id 游戏代号
start_time	String字串	Y是	bet time (the moment player submit/place the bet) GMT/UTC +0 下注时间(玩家实际的投注时间)，依据 GMT/UTC +0 时区
end_time	String字串	Y是	settlement time GMT/UTC +0 结算时间，依据 GMT/UTC +0 时区
match_time	String字串	Y是	match start time GMT/UTC +0 开赛时间，依据 GMT/UTC +0 时区
bet_detail	String字串	Y是	Bet details 投注明细
turnover	Double小数点	Y是	Valid bet amount 有效投注金额
bet	Double小数点	Y是	Bet amount 投注金额
payout	Double小数点	Y是	Payout 派彩金额
commission	Double小数点	Y是	Commission 佣金
p_share	Double小数点	Y是	Jackpot bet amount 彩池投注金额
p_win	Double小数点	Y是	Jackpot payout 彩池派彩金额
status	Int 整数字	Y是	Status of this record 注单状态
1 (valid bet record 有效注单)
0 (running/ongoing match 赛事进行中)
-1 (invalid bet record 无效注单 e.g. voided 作废, canceled 取消)
remark_1	String字串	Y是	extra wager information
Example 范例

Player bet banker with amount=5, at the same time bet player with amount=5. Turnover will be 0
当玩家以投注金额=5同时在庄与闲进行下注，{turnover有效投注金额}将会是0.

D - QnA / 常问疑问
Question 1
From API Document, createMember only require {username} and without {password} But others API like getBalance and changePassword required to pass in the {password} value. May I know how do I set the initial {password}?

Answer 1
When createMember,

It only create member account on AIO system.
Member account will not created on game provider side.
When you request any API with {providercode} and {username},

API example : getBalance, makeTransfer, launchGames, changePassword and others
If member not exists on related {providercode}, member account will auto created and {password} will be stored in provider side and your API request will return like usual.
If member exists on related {providercode}, your API request will return like usual.
AIO system not store your member {password}, please store your member {password} carefully.
Each member will have different {password} for different {providercode}.
疑问 1
API 文件中, createMember 只需要提供 {username} , 不需要密码{password}. 但其他API，如 getBalance 和 changePassword 需要提供 {password} . 请问需要如何设置 {password} ?

答案 1
当 createMember 时,

createMember 只在 AIO 系统中创建会员.
游戏供应商 {providercode} 不会创建会员.
当您请求任何需要 {providercode} 和 {username} 的 API ,

API 样本: getBalance, makeTransfer, launchGames, changePassword 或其他
如该 {providercode} 会员不存在, 会员将会自动创建， {password} 密码将保存在供应商服务器, 您的API请求将正常返回.
如该 {providercode} 会员已经存在, 您的API请求将正常返回.
AIO 系统不会保存您的 {password}, 请妥善保存您的 {password}.
每个会员中的{providercode} , 可以使用不同的 {password}.
Question 2
Any suggestion on password?

Answer 2
at least one big letter.
at least one small letter.
do not have continuous such as（123 ，234，456).
larger than 6 character.
Example:

password = Qwer124
if did not utilize this suggestion, you might facing password issue if you took PU,KS.

疑问 2
密码格式推荐

答案 2
至少一个大写.
至少一个小写.
然后不要有连续的数目比如（123 ，234，456).
大于6个字.
例子:

password = Qwer124
若选择不根据要求，可能在KS,PU 会发生密码api问题.

Question 3
What will happen if i do not convert username and operatorcode to small letter before sending API request to GSC ?

Answer 3
GSC system will convert username and operatorcode to small letter.
Please remember that some of the API is using username and operatorcode to create signature. MD5 is case sensitive.
疑问 3
若没把operatorcode和username转换成小写就 发送API请求给GSC，会发生什么事。

答案 3
GSC 会自行转换去小写。
username 和 operatorcode 是会用于 制作签名。 MD5 是区分大小写
E - Special request on launch game / 开启游戏的特殊接口请求
Product code 供应商代号: IG

Example 例子:
<API_URL>/launchGames.aspx?operatorcode=d8kr&providercode=IG&username=dv69000XXX&password=kJiCDDX7&type=LK&lang=ko-KR&gameid=2&signature=1281A073C04822BB5838DD861EC15C40

Fields 参数	Type 资料型态	Required 必要	Description 参数说明
gameid	String 字串		1 - HK 香港彩
2 - SSC 时时彩
Product code 供应商代号: S6

Example 例子:
<API_URL>/launchGames.aspx?operatorcode=d8kr&providercode=S6&username=dv69000XXX&password=kJiCDDX7&type=SL&lang=ko-KR&gameid=S6_FC&signature=1281A073C04822BB5838DD861EC15C40

<API_URL>/launchGames.aspx?operatorcode=d8kr&providercode=S6&username=dv69000XXX&password=kJiCDDX7&type=LC&lang=ko-KR&gameid=S6_VENUS&signature=1281A073C04822BB5838DD861EC15C40

Fields 参数	Type 资料型态	Required 必要	Description 参数说明
type	String 字串	Y 是	SL – Slot
LC – Live Casino
FH – Fishing Game
OT - Other
gameid	String 字串	Y 是	Type SL Supported Game ID
1.) S6_FC : Fa Chai

Type LC Supported Game ID
1.) S6_VENUS : Venus
2.) 0 : Sexy Baccarat

Type FH Supported Game ID
1.) S6_FC : Fa Chai

Type OT Supported Game ID
1.) 0 : SV388
Product code 供应商代号: P3

Example 例子:
<API_URL>/launchGames.aspx?operatorcode=d8kr&providercode=P3&username=dv69000XXX&password=kJiCDDX7&type=LC&lang=ko-KR&gameid=1_0&signature=1281A073C04822BB5838DD861EC15C40

Fields 参数	Type 资料型态	Required 必要	Description 参数说明
type	String 字串	Y 是	SL – Slot
LC – Live Casino
gameid	String 字串	Y 是	Type SL Supported Game ID
1.) 0

Type LC Supported Game ID
1.) 1_0 : Evolution
Product code 供应商代号: BD

Example 例子:
<API_URL>/launchGames.aspx?operatorcode=d8kr&providercode=BD&username=dv69000XXX&password=kJiCDDX7&type=SL&lang=ko-KR&gameid=bpgbrtctab&signature=1281A073C04822BB5838DD861EC15C40

Fields 参数	Type 资料型态	Required 必要	Description 参数说明
type	String 字串	Y 是	SL – Slot
CB – CARD & BOARDGAME
gameid	String 字串	Y 是	Use below gameID will go to specific Tab in the lobby
bpgbrtctab : Baccarat Classic
bpgbrtsstab : Baccarat Super Six
bpgbrtptab : Baccarat Private
bpgdrtgrtab : Dragon Tiger
bpgblkjktab : BlackJack
bpgrlttab : Roulette
bpgsltgmtab : Slot Game
bpgcslgmtab : Casual Game
F - API IP Whitelist(upon request)
The GSC system supports API access via IP whitelisting. Once enabled, only requests originating from the registered IP address will be accepted, even if the API key is valid. Please contact Customer Service to provide your fixed (static) IP address.

GSC 系统支持通过 IP 白名单方式进行 API 访问控制。启用后，仅来自已登记 IP 地址的请求才会被接受，即使 API 密钥有效，其他 IP 的请求也将被拒绝。请联系客户服务提供您的固定（静态）IP 地址。