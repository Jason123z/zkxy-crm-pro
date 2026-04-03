import pymysql
import os
import re
from dotenv import load_dotenv

# 加载配置
load_dotenv()
mysql_url = os.getenv("MYSQL_URL", "")

# 解析连接信息
# 示例格式: mysql+pymysql://root:password@localhost:3306/zkxy_crm
try:
    # 使用正则解析连接字符串以应对各种情况（尤其是空密码）
    match = re.match(r"mysql\+pymysql://([^:]+):?([^@]*)@([^:]+):(\d+)/(.+)", mysql_url)
    if not match:
        raise ValueError("MYSQL_URL 格式不匹配")
    user, pwd, host, port, db_name = match.groups()
    port = int(port)
except Exception as e:
    print(f"解析 .env 中的 MYSQL_URL 失败: {e}")
    exit(1)

print(f"开始初始化数据库...")

try:
    # 1. 第一次连接，不指定数据库（为了创建它）
    conn = pymysql.connect(
        host=host,
        user=user,
        password=pwd,
        port=port,
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    
    # 创建数据库
    print(f"Step 1: 正在创建数据库 '{db_name}'...")
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    conn.select_db(db_name)
    
    # 2. 读取并执行 SQL 文件
    print(f"Step 2: 正在读取并导入表结构 (mysql_schema.sql)...")
    if not os.path.exists('mysql_schema.sql'):
        print("❌ 错误：找不到 mysql_schema.sql 文件！")
        exit(1)

    with open('mysql_schema.sql', 'r', encoding='utf-8') as f:
        # 使用正则表达式分割语句，处理复合 SQL 文件
        sql_content = f.read()
        # 移除注释和空行
        sql_content = re.sub(r'--.*?\n', '', sql_content)
        sql_content = re.sub(r'/\*.*?\*/', '', sql_content, flags=re.S)
        
        sql_commands = sql_content.split(';')
        for command in sql_commands:
            cmd = command.strip()
            if cmd:
                try:
                    cursor.execute(cmd)
                except Exception as e:
                    # 忽略一些非致命错误，比如表已存在
                    if "already exists" not in str(e):
                        print(f"执行 SQL 出错: {e}")
    
    conn.commit()
    print("数据库及表结构创建成功！")
    
    # 3. 运行已有的初始化数据脚本 (init_db_data.py)
    print("Step 3: 正在运行初始化基础数据脚本...")
    if os.path.exists('init_db_data.py'):
        # 我们可以直接导入并执行，或者通过系统命令调用
        # 这里选择系统命令调用以保持环境一致性
        os.system("python init_db_data.py")
    else:
        print("警告：找不到 init_db_data.py 脚本，跳过基础数据初始化。")
    
    print("\n所有初始化任务已完成！您可以启动项目了。")

except Exception as e:
    print(f"初始化失败: {e}")
    print("\n提示：")
    print("1. 请检查您的 MySQL 服务是否已启动。")
    print("2. 请检查 .env 中的用户、密码、地址、端口是否正确。")
    print("3. 当前使用的连接信息: " + f"用户={user}, 地址={host}, 端口={port}")
finally:
    if 'conn' in locals():
        conn.close()
