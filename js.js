var tem = "orderid-int(10)-订单ID\nuserid-int(10)-用户ID\ncreationtime-datetime-创建时间\npaymenttime-datetime-付款时间\namount-double-订单金额\nstatus-varchar(5)-付款状态"
document.getElementById("fields").value=tem;
// 创建并保存sql数据
function generateAndSaveSQL() {
  // 获取用户输入的表名和字段信息
  const tableName = document.getElementById('tableName');
  const fieldsInput = document.getElementById('fields');
  const fields = fieldsInput.value.split('\n');
  const sqldata = localStorage.getItem('generatedSQL')?? false;
	// 生成SQL语句
	const sql = generateSQL(tableName.value, fields);
  // 将生成的SQL语句保存到浏览器缓存（localStorage）
  if(sqldata){
      localStorage.setItem('generatedSQL', sqldata+"\n\n"+sql);
  }else{
      localStorage.setItem('generatedSQL', sql);
  }
  
  alert('SQL语句已成功保存到缓存。');
}
//光标处写入
function cursor(text,id='fields'){
	//获取dom
	var elInput = document.getElementById(id);
	//光标开始的下标
	var startPos = elInput.selectionStart;
	//光标结束的下标
	var endPos = elInput.selectionEnd;
	if (startPos === undefined || endPos === undefined) return
	//获取dom中的值
	var txt = elInput.value;
	//光标开始跟结束之间内容替换
	var result = txt.substring(0, startPos) +text + txt.substring(endPos)
	elInput.value = result;
	elInput.focus();
	//设置光标的位置设为添加内容后的位置
	elInput.selectionStart = startPos + text.length;
	elInput.selectionEnd = startPos + text.length;
}
// 创建sql
function generateSQL(tableName, fields) {
  let sql = '';

  // 处理表名和注释
  const tablecomment = tableName.split('-');
  const tableNameOnly = tablecomment[0];
  const tablecomments = tablecomment[1];

  // 添加删除表语句
  sql += `DROP TABLE IF EXISTS \`${tableNameOnly}\`;\n`;
  // 开始创建表语句
  sql += `CREATE TABLE \`${tableNameOnly}\` (\n`;
  // 定义主键字段
  sql += `  \`id\` int(10) NOT NULL AUTO_INCREMENT COMMENT '序列号',\n`;

  // 遍历每个字段，生成对应的SQL字段定义
  for (let i = 0; i < fields.length; i++) {
    // 以 '-' 为分隔符分割字段名和类型
    const fieldParts = fields[i].split('-');
    if (fieldParts.length!== 3) {
      // 如果字段格式不合法，跳过该字段
      console.log(`跳过无效字段: ${fields[i]}`);
      continue;
    }
    const fieldName = fieldParts[0];//表字段
    const fieldType = fieldParts[1];//表类型
    const comment = fieldParts[2];//表注释
    let defaultValue = '';
    // 根据字段类型判断默认值是否需要设置字符集
    if (fieldType.includes('varchar') || fieldType.includes('text') || fieldType.includes('longtext')) {
      defaultValue = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL';
    } else {
      defaultValue = 'DEFAULT NULL';
    }
    // 拼接字段定义语句
    sql += `  \`${fieldName}\` ${fieldType} ${defaultValue} COMMENT '${comment}',\n`;
  }

  // 添加主键定义和表的其他选项
  sql += `  PRIMARY KEY (\`id\`) USING BTREE COMMENT '${tablecomments}'\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='${tablecomments}';\n`;
  // 锁表语句
  sql += `LOCK TABLES \`${tableNameOnly}\` WRITE;\n`;
  // 解锁表语句
  sql += `UNLOCK TABLES;\n\n`;

  return sql;
}
// 下载sql
function downloadSQL() {
  // 从缓存中获取生成的SQL语句
  const sql = localStorage.getItem('generatedSQL');
  if (!sql) {
    alert('缓存中没有可用的SQL语句，请先生成并保存到缓存。');
    return;
  }

  // 创建一个Blob对象，用于存储SQL数据
  const blob = new Blob([sql], { type: 'text/plain' });

  // 创建一个下载链接
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = 'generated_sql.sql';

  // 模拟点击下载链接
  downloadLink.click();

  // 释放URL对象
  URL.revokeObjectURL(downloadLink.href);
}

//查看sql
function viewSQL(){
	// 从缓存中获取生成的SQL语句
	const sql = localStorage.getItem('generatedSQL');
	var fieldsInput = document.getElementById('fields');
	if(sql){
		fieldsInput.value=sql;
	}
}
//清空sql
function clearSQL(){
	localStorage.removeItem('generatedSQL');
}