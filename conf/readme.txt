项目结构说明
package.json	项目描述文件,用于 NPM 等工具
robots.txt		搜索引擎访问限制
server.js 		启动脚本
app.js 			项目主程序
locConfig.js 	本地配置项，用于覆盖config/conf.js 内的同名配置项，不纳入版本管理

bin 			项目启动、打包等预设命令行
logs			日志文件，线上发布根据运维需要可能改用其他位置的文件夹，不纳入版本管理
node_modules	项目依赖的模块，由 NPM 管理，不纳入版本管理
tar				项目打包发布时创建的打包文件，不纳入版本管理

seo				seo使用到的 sitemap 文件，百度统计校验文件
conf			项目配置文件

middleware		项目通用KOA中间件
utils			通用辅助函数,ejs模版过滤器
router			路由器文件,可按模块分出子文件夹
controller		控制器文件,可按模块分出子文件夹
provider		静态数据文件、数据接口、数据库连接等,可按模块分出子文件夹
views			模板文件,可按模块分出子文件夹,views/component 内是供引用的模板碎片
public			样式文件、图片及js脚本和其他可直接访问的简单静态页面,其中sass未编译样式文件, src内是未压缩样式和js ,dist已压缩样式和js













