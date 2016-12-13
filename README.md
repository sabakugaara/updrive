# merry

> upyun 资源管理器

## 构建

``` bash
# 安装依赖
npm install

# 启动
npm run dev

# 打包
npm run build

# webpack 打包
npm run pack
```

## TODO

- [ ] 文件图标
- [ ] 文件目录
- [ ] 上传
- [ ] 搜索
- [ ] 排序
- [ ] 方向键 enter键 alt

## 整理一下呗

上传文件参数

- Content-Secret 文件密钥
- Content-Type 文件类型
- Content-MD5	是否需要 MD5 校验
- X-Upyun-Meta-X meta 信息
- b64encoded 解码
- x-gmkerl-thumb 图片处理 断点续传不允许 预处理
- 音视频预处理请求

getTree



