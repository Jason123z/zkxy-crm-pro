import pymysql
import os
import re
from dotenv import load_dotenv
import subprocess

# 加载配置
load_dotenv()
mysql_url = os.getenv("MYSQL_URL", "")

# 解析连接信息
try:
    match = re.match(r"mysql\+pymysql://([^:]+):?([^@]*)@([^:]+):(\d+)/(.+)", mysql_url)
    if not match:
        raise ValueError("MYSQL_URL 格式不匹配")
    user, pwd, host, port, db_name = match.groups()
    port = int(port)
except Exception as e:
    print(f"❌ .env 文件中的 MYSQL_URL 格式不正确: {e}")
    exit(1)

print(f"正在清空数据库 '{db_name}' 中的所有数据...")

try:
    # 1. 连接到 MySQL (不指定数据库，以便执行 DROP 操作)
    conn = pymysql.connect(
        host=host,
        user=user,
        password=pwd,
        port=port,
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    
    # 2. 删除并重新创建数据库
    print(f"步骤 1: 正在删除数据库 '{db_name}'...")
    cursor.execute(f"DROP DATABASE IF EXISTS {db_name}")
    
    print(f"步骤 2: 正在重新创建数据库 '{db_name}'...")
    cursor.execute(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    
    conn.commit()
    conn.close()
    print("数据库已清空并重置。")
    
    # 3. 调用 auto_setup_mysql.py 还原结构和初始数据
    print("步骤 3: 正在同步表结构并初始化基础数据...")
    if os.path.exists('auto_setup_mysql.py'):
        # 使用 subprocess 运行以确保捕获输出
        result = subprocess.run(["python", "auto_setup_mysql.py"], capture_output=True, text=True, encoding='gbk')
        print(result.stdout)
        if result.returncode != 0:
            print(f"初始化脚本执行失败，错误代码: {result.returncode}")
            if result.stderr:
                print(f"详情:\n{result.stderr}")
            exit(1)
    else:
        print("错误：找不到 auto_setup_mysql.py 脚本！")
        exit(1)
    
    print("\n数据库重置成功！所有测试数据已删除，系统已恢复至初始状态。")

except Exception as e:
    print(f"重置失败: {e}")
    exit(1)
