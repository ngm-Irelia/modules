HTTP 超文本传输协议 Hyper Text Transfer Protocol
服务器与客户端消息传递的协议

基于 TCP/IP 协议

四部分介绍:
1.URL
2.请求
3.响应
4.消息报头

特点是: 1简单快速 ,2灵活, 3无状态, 4无连接,
1.客户端只需要给服务器端传送 请求的方法和参数等,简单,数据量小,通讯速度快
2.http允许穿任意类型的数据对象. 由 Content-Type 标记
3.每次连接只处理一次请求.请求完成,四次握手就断开连接.
4.对事务没有记忆能力  (也就不能区分客户端的身份)

1.URL 统一资源定位器
也就是请求地址

2.请求
http请求 组成成分: 请求行, 请求头, 空行, 请求体

请求行: 存放信息: 说明请求的类型(GET,POST等) 请求资源 http版本,
请求行: 存放信息: 服务器要使用的附加信息,
空行: 请求头部后面的空行是必须的,
请求体: 存放请求的数据,

3.响应
http响应 组成成分:  状态行, 消息报头, 空行, 响应正文 ,

4.消息报头

常用的请求头字段介绍:
1. Accept 设置接收的内容类型 
   例: accept: application/json

2. Accept-Charset 设置接受的字符编码
   例: Accept-Charset: utf-8
   
3. Accept-Charset 设置接受的字符编码
   例: Accept-Charset: utf-8
   
4. Accept-Encodeing 设置接受的编码格式
   例: accept-encoding: gzip, deflate, br
   
5. Accept-Datetime  设置接受的版本时间
   例: Accept-Datetime: Thu, 31 May 2007 20:35:00 GMT
   
6. Accept-Language  设置接受的语言
   例: accept-language: zh-CN,zh;q=0.9  
   
7. Authorization 设置HTTP身份验证的凭证
   例: Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ== 
   
8. Cache-Control 缓存机制指令
   例: Cache-Control: no-cache
   
9. Connection 设置当前连接
   例: Connection: keep-alive
   
10. Content-Length 设置请求体的字节长度
   例: Content-Length: 348
   
11. Content-Type 设置请求体的MIME类型（适用POST和PUT请求）
   例: Content-Type: application/x-www-form-urlencoded

12. Cookie 设置服务器使用Set-Cookie发送的http cookie
   例: Cookie: $Version=1; Skin=new;

13. Date 设置消息发送的日期和时间
   例: Date: Tue, 15 Nov 1994 08:12:31 GMT

14. If-Match 缓存使用 设置客户端的ETag,当时客户端ETag和服务器生成的ETag一致才执行，适用于更新自从上次更新之后没有改变的资源
   例: If-Match: "737060cd8c284d8af7ad3082f209582d
  
15. If-Modified-Since 设置更新时间，从更新时间到服务端接受请求这段时间内如果资源没有改变，允许服务端返回304 Not Modified
   例: If-Modified-Since: Sat, 29 Oct 1994 19:43:31 GMT

16. If-None-Match 设置客户端ETag，如果和服务端接受请求生成的ETage相同，允许服务端返回304 Not Modified
   例: If-None-Match: "737060cd8c284d8af7ad3082f209582d"

17. If-Range 设置客户端ETag，如果和服务端接受请求生成的ETage相同，返回缺失的实体部分；否则返回整个新的实体
   例: If-Range: "737060cd8c284d8af7ad3082f209582d"

18. Range 请求部分实体，设置请求实体的字节数范围，具体可以参见HTTP/1.1中的Byte serving
   例: Range: bytes=500-999

19. Referer 设置前一个页面的地址，并且前一个页面中的连接指向当前请求，意思就是如果当前请求是在A页面中发送的，那么referer就是A页面的url地址（轶事：这个单词正确的拼法应该是"referrer",但是在很多规范中都拼成了"referer"，所以这个单词也就成为标准用法）
   例: Referer: http://en.wikipedia.org/wiki/Main_Page

...


常用标准响应头字段:

1. Access-Control-Allow-Origin 指定哪些站点可以参与跨站资源共享
   例: Access-Control-Allow-Origin: *
   
2. Cache-Control 告诉服务端到客户端所有的缓存机制是否可以缓存这个对象，单位是秒
   例: cache-control: max-age=0, private, must-revalidate

3. Content-Disposition 告诉客户端弹出一个文件下载框，并且可以指定下载文件名
   例: Content-Disposition: attachment; filename="fname.ext"

4. Content-Type 设置响应体的MIME类型
   例: Content-Type: text/html; charset=utf-8

5. Date 设置消息发送的日期和时间
   例: Date: Tue, 15 Nov 1994 08:12:31 GMT

6. ETag 特定版本资源的标识符，通常是消息摘要
   例: ETag: "737060cd8c284d8af7ad3082f209582d"

7. Expires 设置响应体的过期时间
   例: Expires: Thu, 01 Dec 1994 16:00:00 GMT

8. Last-Modified 设置请求对象最后一次的修改日期
   例: Last-Modified: Tue, 15 Nov 1994 12:45:26 GMT

9. Set-Cookie 设置HTTP Cookie
   例: Set-Cookie: UserID=JohnDoe; Max-Age=3600; Version=1

常用非标准响应头字段#####
1. X-XSS-Protection 过滤跨站脚本
   例: X-XSS-Protection: 1; mode=block

2. X-Content-Type-Options 唯一的取值是"",阻止IE在响应中嗅探定义的内容格式以外的其他MIME格式
   例: X-Content-Type-Options: nosniff

3. X-Request-ID,X-Correlation-ID 标识一个客户端和服务端的请求
   例: X-Request-ID: f058ebd6-02f7-4d3f-942e-904344e8cde5













