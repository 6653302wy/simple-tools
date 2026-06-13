import type { LocalizedText } from '@/services/i18n/constant';

export type CommandCategory = 'linux' | 'nginx' | 'docker' | 'systemd' | 'network';

export type CommandEntry = {
    id: string;
    category: CommandCategory;
    title: LocalizedText;
    description: LocalizedText;
    command: string;
    note?: LocalizedText;
    tags: string[];
};

export const commandCategoryLabels: Record<CommandCategory, LocalizedText> = {
    linux: { zh: 'Linux', en: 'Linux' },
    nginx: { zh: 'Nginx', en: 'Nginx' },
    docker: { zh: 'Docker', en: 'Docker' },
    systemd: { zh: 'Systemd', en: 'Systemd' },
    network: { zh: '网络排查', en: 'Network' },
};

export const commandCategoryOrder: CommandCategory[] = ['linux', 'nginx', 'docker', 'systemd', 'network'];

export const commandEntries: CommandEntry[] = [
    {
        id: 'linux-system-info',
        category: 'linux',
        title: { zh: '查看系统版本', en: 'Check system version' },
        description: { zh: '确认发行版、内核和 CPU 架构。', en: 'Check distro, kernel and CPU architecture.' },
        command: `cat /etc/os-release
uname -a
hostnamectl
lscpu`,
        tags: ['linux', 'system', 'version', 'kernel', 'cpu'],
    },
    {
        id: 'linux-package-apt',
        category: 'linux',
        title: { zh: 'APT 软件包管理', en: 'APT package management' },
        description: {
            zh: 'Debian/Ubuntu 常用安装、升级和查询。',
            en: 'Common Debian/Ubuntu install, upgrade and query commands.',
        },
        command: `sudo apt update
sudo apt install <package>
sudo apt upgrade
apt search <keyword>
apt show <package>`,
        tags: ['linux', 'apt', 'ubuntu', 'debian', 'install'],
    },
    {
        id: 'linux-package-dnf',
        category: 'linux',
        title: { zh: 'DNF/YUM 软件包管理', en: 'DNF/YUM package management' },
        description: {
            zh: 'RHEL/CentOS/Rocky/Alma 常用安装、升级和查询。',
            en: 'Common RHEL/CentOS/Rocky/Alma install, upgrade and query commands.',
        },
        command: `sudo dnf install <package>
sudo dnf update
dnf search <keyword>
dnf info <package>
rpm -qa | grep <keyword>`,
        tags: ['linux', 'dnf', 'yum', 'rhel', 'centos', 'install'],
    },
    {
        id: 'linux-files-basic',
        category: 'linux',
        title: { zh: '文件和目录基础', en: 'File and directory basics' },
        description: {
            zh: '查看、创建、复制、移动和删除文件目录。',
            en: 'List, create, copy, move and remove files or folders.',
        },
        command: `pwd
ls -lah
mkdir -p /path/to/dir
cp -a source target
mv source target
rm -i file`,
        tags: ['linux', 'file', 'directory', 'ls', 'cp', 'mv', 'rm'],
    },
    {
        id: 'linux-permissions',
        category: 'linux',
        title: { zh: '权限和归属', en: 'Permissions and ownership' },
        description: { zh: '查看和调整文件权限、属主、属组。', en: 'Inspect and change permissions, owner and group.' },
        command: `ls -l /path/to/file
sudo chmod 644 /path/to/file
sudo chmod 755 /path/to/dir
sudo chown user:group /path/to/file
sudo chown -R user:group /path/to/dir`,
        tags: ['linux', 'permission', 'chmod', 'chown', 'owner'],
    },
    {
        id: 'linux-archive',
        category: 'linux',
        title: { zh: '压缩和解压', en: 'Archive and extract' },
        description: { zh: '处理 tar.gz、zip 等常见归档。', en: 'Work with tar.gz, zip and common archives.' },
        command: `tar -czf app.tar.gz /path/to/app
tar -xzf app.tar.gz -C /target/dir
zip -r app.zip /path/to/app
unzip app.zip -d /target/dir`,
        tags: ['linux', 'tar', 'zip', 'archive', 'extract'],
    },
    {
        id: 'linux-find-text',
        category: 'linux',
        title: { zh: '查找文件和文本', en: 'Find files and text' },
        description: { zh: '按文件名、大小、内容关键词定位目标。', en: 'Locate files by name, size or text content.' },
        command: `find /path -name "*.log"
find /path -type f -size +100M
grep -R "ERROR" /path/to/logs
grep -n "keyword" file.txt`,
        tags: ['linux', 'find', 'grep', 'search', 'text'],
    },
    {
        id: 'linux-disk-usage',
        category: 'linux',
        title: { zh: '查看磁盘占用', en: 'Check disk usage' },
        description: { zh: '快速确认文件系统容量和目录占用。', en: 'Inspect filesystem capacity and folder usage.' },
        command: `df -h

du -sh /path/to/dir`,
        tags: ['linux', 'disk', 'df', 'du', 'storage'],
    },
    {
        id: 'linux-large-files',
        category: 'linux',
        title: { zh: '查找大文件', en: 'Find large files' },
        description: { zh: '定位当前目录下最占空间的文件。', en: 'Find the files using the most space under a path.' },
        command: `find /path/to/dir -type f -size +100M -print

find /path/to/dir -type f -exec du -h {} + | sort -hr | head -20`,
        tags: ['linux', 'find', 'large files', 'disk'],
    },
    {
        id: 'linux-memory-cpu',
        category: 'linux',
        title: { zh: 'CPU 和内存状态', en: 'CPU and memory status' },
        description: { zh: '查看负载、内存、进程资源占用。', en: 'Inspect load, memory and process resource usage.' },
        command: `uptime
free -h
top
ps aux --sort=-%mem | head
ps aux --sort=-%cpu | head`,
        tags: ['linux', 'cpu', 'memory', 'load', 'top', 'free'],
    },
    {
        id: 'linux-process',
        category: 'linux',
        title: { zh: '查看进程和端口', en: 'Inspect processes and ports' },
        description: { zh: '排查进程 CPU/内存占用和端口监听。', en: 'Check process usage and listening ports.' },
        command: `ps aux | sort -nrk 3 | head

lsof -nP -iTCP -sTCP:LISTEN`,
        tags: ['linux', 'process', 'port', 'ps', 'lsof'],
    },
    {
        id: 'linux-kill-process',
        category: 'linux',
        title: { zh: '结束进程', en: 'Stop a process' },
        description: { zh: '按 PID 或进程名终止异常进程。', en: 'Terminate a process by PID or process name.' },
        command: `pgrep -af <keyword>
kill <pid>
kill -9 <pid>
pkill -f <keyword>`,
        note: {
            zh: '先用普通 kill；只有进程无法退出时再考虑 kill -9。',
            en: 'Try regular kill first; use kill -9 only when the process cannot exit.',
        },
        tags: ['linux', 'process', 'kill', 'pkill'],
    },
    {
        id: 'linux-logs',
        category: 'linux',
        title: { zh: '实时查看日志', en: 'Tail logs' },
        description: { zh: '跟踪文件新增日志并按关键词过滤。', en: 'Follow appended log lines and filter by keyword.' },
        command: `tail -f /var/log/syslog

tail -f /path/to/app.log | grep --line-buffered "ERROR"`,
        tags: ['linux', 'logs', 'tail', 'grep'],
    },
    {
        id: 'linux-users',
        category: 'linux',
        title: { zh: '用户和用户组', en: 'Users and groups' },
        description: { zh: '创建用户、加入组、查看身份。', en: 'Create users, add groups and inspect identity.' },
        command: `id
whoami
sudo useradd -m <user>
sudo passwd <user>
sudo usermod -aG <group> <user>
groups <user>`,
        tags: ['linux', 'user', 'group', 'usermod', 'passwd'],
    },
    {
        id: 'linux-sudo',
        category: 'linux',
        title: { zh: 'sudo 权限', en: 'sudo privileges' },
        description: { zh: '给用户加入 sudo/wheel 管理组。', en: 'Add a user to the sudo or wheel admin group.' },
        command: `sudo usermod -aG sudo <user>
sudo usermod -aG wheel <user>
sudo visudo`,
        note: {
            zh: '不同发行版使用 sudo 或 wheel 组，修改前先确认系统约定。',
            en: 'Different distros use sudo or wheel. Check your distro convention first.',
        },
        tags: ['linux', 'sudo', 'wheel', 'visudo'],
    },
    {
        id: 'linux-cron',
        category: 'linux',
        title: { zh: '定时任务 Cron', en: 'Cron jobs' },
        description: { zh: '编辑、查看当前用户定时任务。', en: 'Edit and list current user cron jobs.' },
        command: `crontab -e
crontab -l

# 每天 03:00 执行脚本
0 3 * * * /path/to/script.sh >> /var/log/script.log 2>&1`,
        tags: ['linux', 'cron', 'schedule', 'crontab'],
    },
    {
        id: 'linux-vim',
        category: 'linux',
        title: { zh: 'Vim 常用操作', en: 'Vim basics' },
        description: { zh: '保存、退出、查找和显示行号。', en: 'Save, quit, search and show line numbers.' },
        command: `i                 # 插入模式
Esc               # 返回普通模式
:w                # 保存
:q                # 退出
:wq               # 保存并退出
:q!               # 放弃修改
/keyword          # 搜索
:set number       # 显示行号`,
        tags: ['linux', 'vim', 'editor'],
    },
    {
        id: 'linux-reboot-shutdown',
        category: 'linux',
        title: { zh: '重启和关机', en: 'Reboot and shutdown' },
        description: {
            zh: '安全重启、关机和取消计划任务。',
            en: 'Safely reboot, shut down and cancel scheduled shutdown.',
        },
        command: `sudo reboot
sudo shutdown -h now
sudo shutdown -r +5
sudo shutdown -c`,
        tags: ['linux', 'reboot', 'shutdown'],
    },
    {
        id: 'nginx-install-apt-distro',
        category: 'nginx',
        title: { zh: '快速安装 Nginx（系统源）', en: 'Install Nginx from distro repo' },
        description: {
            zh: '用系统默认仓库安装，适合快速验证。',
            en: 'Use the default distro repository for a quick setup.',
        },
        command: `sudo apt update
sudo apt install nginx

sudo dnf install nginx`,
        tags: ['nginx', 'install', 'apt', 'dnf', 'ubuntu', 'rhel'],
    },
    {
        id: 'nginx-install-official-ubuntu',
        category: 'nginx',
        title: { zh: '安装 Nginx 官方源（Ubuntu）', en: 'Install official Nginx repo on Ubuntu' },
        description: {
            zh: '添加 nginx.org stable 仓库后安装。',
            en: 'Add the nginx.org stable repository, then install.',
        },
        command: `sudo apt install curl gnupg2 ca-certificates lsb-release ubuntu-keyring
curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] https://nginx.org/packages/ubuntu $(lsb_release -cs) nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
sudo apt update
sudo apt install nginx`,
        tags: ['nginx', 'install', 'official', 'ubuntu', 'apt'],
    },
    {
        id: 'nginx-install-official-rhel',
        category: 'nginx',
        title: { zh: '安装 Nginx 官方源（RHEL 系）', en: 'Install official Nginx repo on RHEL' },
        description: {
            zh: '配置 nginx.org stable yum 仓库后安装。',
            en: 'Configure the nginx.org stable yum repository, then install.',
        },
        command: `sudo yum install yum-utils
sudo tee /etc/yum.repos.d/nginx.repo <<'EOF'
[nginx-stable]
name=nginx stable repo
baseurl=https://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
EOF
sudo yum install nginx`,
        tags: ['nginx', 'install', 'official', 'rhel', 'centos', 'yum'],
    },
    {
        id: 'nginx-enable-start',
        category: 'nginx',
        title: { zh: '启动并设置自启', en: 'Start and enable Nginx' },
        description: {
            zh: '安装后启动服务并加入开机自启。',
            en: 'Start the service after installation and enable boot startup.',
        },
        command: `sudo systemctl enable --now nginx
sudo systemctl status nginx
curl -I http://localhost`,
        tags: ['nginx', 'start', 'enable', 'systemctl', 'status'],
    },
    {
        id: 'nginx-docker-run',
        category: 'nginx',
        title: { zh: '用 Docker 运行 Nginx', en: 'Run Nginx with Docker' },
        description: {
            zh: '快速拉起 Nginx 容器并挂载配置和站点目录。',
            en: 'Start an Nginx container with mounted config and site folders.',
        },
        command: `docker run -d --name nginx \\
-p 80:80 \\
-v /opt/nginx/conf.d:/etc/nginx/conf.d:ro \\
-v /opt/nginx/html:/usr/share/nginx/html:ro \\
-v /opt/nginx/logs:/var/log/nginx \\
nginx:alpine`,
        tags: ['nginx', 'docker', 'run', 'install', 'container'],
    },
    {
        id: 'nginx-test-reload',
        category: 'nginx',
        title: { zh: '检查并重载配置', en: 'Test and reload config' },
        description: {
            zh: '修改 Nginx 配置后先校验，再平滑重载。',
            en: 'Validate Nginx config before a graceful reload.',
        },
        command: `sudo nginx -t

sudo systemctl reload nginx`,
        note: {
            zh: '生产环境先执行 nginx -t，确认无误后再 reload。',
            en: 'Run nginx -t first in production, then reload after it passes.',
        },
        tags: ['nginx', 'config', 'reload', 'systemctl'],
    },
    {
        id: 'nginx-config-paths',
        category: 'nginx',
        title: { zh: '常见配置路径', en: 'Common config paths' },
        description: {
            zh: '快速定位主配置、站点配置和日志目录。',
            en: 'Locate main config, site config and log folders.',
        },
        command: `nginx -t
nginx -V 2>&1 | tr ' ' '\\n' | grep -E 'conf-path|error-log-path|http-log-path'
ls -lah /etc/nginx
ls -lah /etc/nginx/conf.d`,
        tags: ['nginx', 'config', 'path', 'nginx -V'],
    },
    {
        id: 'nginx-static-site',
        category: 'nginx',
        title: { zh: '静态站点配置', en: 'Static site config' },
        description: { zh: '创建静态站点目录和 server 配置。', en: 'Create a static site root and server config.' },
        command: `sudo mkdir -p /var/www/example
sudo tee /etc/nginx/conf.d/example.conf <<'EOF'
server {
    listen 80;
    server_name example.com;
    root /var/www/example;
    index index.html;
}
EOF
sudo nginx -t && sudo systemctl reload nginx`,
        tags: ['nginx', 'static', 'server', 'site', 'conf.d'],
    },
    {
        id: 'nginx-location-root-alias',
        category: 'nginx',
        title: { zh: 'Location 静态资源匹配', en: 'Location static file matching' },
        description: {
            zh: '配置 root/alias 静态目录和缓存时间。',
            en: 'Configure root/alias static folders and cache expiry.',
        },
        command: `location ^~ /static/ {
    alias /var/www/app/static/;
    expires 10d;
}

location /media/ {
    root /var/www/app;
}`,
        tags: ['nginx', 'location', 'static', 'root', 'alias', 'cache'],
    },
    {
        id: 'nginx-reverse-proxy',
        category: 'nginx',
        title: { zh: '反向代理配置', en: 'Reverse proxy config' },
        description: { zh: '把域名流量转发到本机应用端口。', en: 'Forward domain traffic to a local app port.' },
        command: `sudo tee /etc/nginx/conf.d/app.conf <<'EOF'
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo nginx -t && sudo systemctl reload nginx`,
        tags: ['nginx', 'proxy', 'reverse proxy', 'conf.d'],
    },
    {
        id: 'nginx-redirect-https',
        category: 'nginx',
        title: { zh: 'HTTP 跳转 HTTPS', en: 'Redirect HTTP to HTTPS' },
        description: {
            zh: '把 80 端口请求永久重定向到 HTTPS。',
            en: 'Permanently redirect port 80 requests to HTTPS.',
        },
        command: `server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}`,
        tags: ['nginx', 'https', 'redirect', '301'],
    },
    {
        id: 'nginx-https-certbot',
        category: 'nginx',
        title: { zh: '申请 HTTPS 证书', en: 'Issue HTTPS certificate' },
        description: {
            zh: '使用 Certbot 为 Nginx 自动配置证书。',
            en: 'Use Certbot to configure an HTTPS certificate for Nginx.',
        },
        command: `sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot renew --dry-run`,
        tags: ['nginx', 'https', 'ssl', 'tls', 'certbot'],
    },
    {
        id: 'nginx-gzip',
        category: 'nginx',
        title: { zh: '开启 Gzip 压缩', en: 'Enable Gzip compression' },
        description: {
            zh: '压缩文本、CSS、JS、JSON 等静态响应。',
            en: 'Compress text, CSS, JS, JSON and similar responses.',
        },
        command: `gzip on;
gzip_min_length 10k;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;`,
        tags: ['nginx', 'gzip', 'compression', 'static'],
    },
    {
        id: 'nginx-timeouts',
        category: 'nginx',
        title: { zh: '请求和代理超时', en: 'Request and proxy timeouts' },
        description: {
            zh: '限制客户端和 upstream 连接等待时间。',
            en: 'Limit client and upstream connection wait time.',
        },
        command: `keepalive_timeout 60;
client_header_timeout 15;
client_body_timeout 15;
send_timeout 15;
client_max_body_size 10m;

proxy_connect_timeout 60;
proxy_read_timeout 60;
proxy_send_timeout 60;`,
        tags: ['nginx', 'timeout', 'proxy', 'upload'],
    },
    {
        id: 'nginx-load-balancing',
        category: 'nginx',
        title: { zh: '负载均衡 upstream', en: 'Load balancing upstream' },
        description: {
            zh: '配置多个后端、权重和备用节点。',
            en: 'Configure multiple backends, weights and backup nodes.',
        },
        command: `upstream backend_server {
    server 10.0.0.11:8000 weight=3;
    server 10.0.0.12:8000 weight=1;
    server 10.0.0.13:8000 backup;
}

location / {
    proxy_pass http://backend_server;
}`,
        tags: ['nginx', 'upstream', 'load balancing', 'proxy', 'weight'],
    },
    {
        id: 'nginx-download-server',
        category: 'nginx',
        title: { zh: '文件下载目录', en: 'File download directory' },
        description: {
            zh: '开启目录索引，提供简单下载服务。',
            en: 'Enable directory listing for a simple download server.',
        },
        command: `location /download {
    root /usr/share/nginx/html;
    autoindex on;
    autoindex_exact_size off;
    autoindex_localtime on;
}`,
        tags: ['nginx', 'download', 'autoindex', 'static'],
    },
    {
        id: 'nginx-firewall',
        category: 'nginx',
        title: { zh: '开放 HTTP/HTTPS 端口', en: 'Open HTTP/HTTPS ports' },
        description: { zh: '在常见防火墙中放行 80 和 443。', en: 'Allow ports 80 and 443 in common firewalls.' },
        command: `sudo ufw allow 'Nginx Full'
sudo ufw status

sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload`,
        tags: ['nginx', 'firewall', 'ufw', 'firewalld', 'http', 'https'],
    },
    {
        id: 'nginx-logs',
        category: 'nginx',
        title: { zh: '查看访问和错误日志', en: 'View access and error logs' },
        description: { zh: '实时查看站点请求和错误信息。', en: 'Follow site traffic and error output.' },
        command: `sudo tail -f /var/log/nginx/access.log

sudo tail -f /var/log/nginx/error.log`,
        tags: ['nginx', 'logs', 'access', 'error'],
    },
    {
        id: 'nginx-log-analyze',
        category: 'nginx',
        title: { zh: '分析访问日志', en: 'Analyze access logs' },
        description: {
            zh: '统计状态码、访问最多 IP 和慢接口线索。',
            en: 'Count status codes, top IPs and slow endpoint clues.',
        },
        command: `awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head
grep ' 500 ' /var/log/nginx/access.log | tail -50`,
        tags: ['nginx', 'logs', 'awk', 'status code', 'access'],
    },
    {
        id: 'nginx-enabled-sites',
        category: 'nginx',
        title: { zh: '启用站点配置', en: 'Enable a site config' },
        description: {
            zh: '在 Debian/Ubuntu 常见布局中启用站点。',
            en: 'Enable a site in the common Debian/Ubuntu layout.',
        },
        command: `sudo ln -s /etc/nginx/sites-available/example.conf /etc/nginx/sites-enabled/example.conf

sudo nginx -t && sudo systemctl reload nginx`,
        tags: ['nginx', 'site', 'sites-enabled', 'reload'],
    },
    {
        id: 'nginx-disable-site',
        category: 'nginx',
        title: { zh: '禁用站点配置', en: 'Disable a site config' },
        description: { zh: '从 sites-enabled 移除站点并重载。', en: 'Remove a site from sites-enabled and reload.' },
        command: `sudo rm /etc/nginx/sites-enabled/example.conf
sudo nginx -t && sudo systemctl reload nginx`,
        note: {
            zh: '只删除软链接，保留 sites-available 中的原配置。',
            en: 'Remove only the symlink and keep the source config in sites-available.',
        },
        tags: ['nginx', 'site', 'disable', 'reload'],
    },
    {
        id: 'nginx-uninstall',
        category: 'nginx',
        title: { zh: '卸载 Nginx', en: 'Uninstall Nginx' },
        description: {
            zh: '移除软件包，可选清理配置和日志。',
            en: 'Remove packages and optionally clear configs and logs.',
        },
        command: `sudo apt remove nginx nginx-common
sudo apt purge nginx nginx-common

sudo dnf remove nginx

sudo rm -rf /etc/nginx /var/log/nginx`,
        note: {
            zh: '最后一行会删除配置和日志，执行前先备份。',
            en: 'The last line deletes configs and logs. Back them up first.',
        },
        tags: ['nginx', 'uninstall', 'remove', 'purge'],
    },
    {
        id: 'docker-remove-old-ubuntu',
        category: 'docker',
        title: { zh: '安装前清理旧 Docker（Ubuntu）', en: 'Remove old Docker packages on Ubuntu' },
        description: {
            zh: '删除可能冲突的发行版自带包。',
            en: 'Remove distro packages that may conflict with official Docker.',
        },
        command:
            'sudo apt remove $(dpkg --get-selections docker.io docker-compose docker-compose-v2 docker-doc podman-docker containerd runc | cut -f1)',
        tags: ['docker', 'install', 'ubuntu', 'remove', 'conflict'],
    },
    {
        id: 'docker-install-ubuntu',
        category: 'docker',
        title: { zh: '安装 Docker（Ubuntu 官方源）', en: 'Install Docker from official Ubuntu repo' },
        description: {
            zh: '添加 Docker apt 仓库并安装 Engine、Buildx、Compose 插件。',
            en: 'Add Docker apt repo and install Engine, Buildx and Compose plugin.',
        },
        command: `sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "\${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`,
        tags: ['docker', 'install', 'ubuntu', 'apt', 'compose', 'buildx'],
    },
    {
        id: 'docker-install-rhel',
        category: 'docker',
        title: { zh: '安装 Docker（RHEL/CentOS 官方源）', en: 'Install Docker from official RHEL/CentOS repo' },
        description: {
            zh: '添加 Docker rpm 仓库并安装完整组件。',
            en: 'Add Docker rpm repo and install the core packages.',
        },
        command: `sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`,
        tags: ['docker', 'install', 'rhel', 'centos', 'dnf', 'compose', 'buildx'],
    },
    {
        id: 'docker-enable-verify',
        category: 'docker',
        title: { zh: '启动并验证 Docker', en: 'Start and verify Docker' },
        description: {
            zh: '启动服务、检查版本、运行 hello-world。',
            en: 'Start the service, check version and run hello-world.',
        },
        command: `sudo systemctl enable --now docker
sudo systemctl status docker
docker version
sudo docker run hello-world`,
        tags: ['docker', 'start', 'enable', 'verify', 'hello-world'],
    },
    {
        id: 'docker-without-sudo',
        category: 'docker',
        title: { zh: '允许当前用户运行 Docker', en: 'Run Docker without sudo' },
        description: { zh: '把当前用户加入 docker 组。', en: 'Add the current user to the docker group.' },
        command: `sudo usermod -aG docker $USER
newgrp docker
docker ps`,
        note: {
            zh: 'docker 组等价于较高权限，只给可信用户加入。',
            en: 'The docker group has high privileges; add only trusted users.',
        },
        tags: ['docker', 'postinstall', 'group', 'sudo'],
    },
    {
        id: 'docker-mirror',
        category: 'docker',
        title: { zh: '配置 Docker 镜像加速', en: 'Configure Docker registry mirror' },
        description: { zh: '写入 daemon.json 后重载 Docker。', en: 'Write daemon.json and reload Docker.' },
        command: `sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://<mirror-host>"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker`,
        tags: ['docker', 'mirror', 'daemon.json', 'registry'],
    },
    {
        id: 'docker-containers',
        category: 'docker',
        title: { zh: '查看容器状态', en: 'List container status' },
        description: { zh: '列出运行中和全部容器。', en: 'List running containers and all containers.' },
        command: `docker ps

docker ps -a`,
        tags: ['docker', 'container', 'ps'],
    },
    {
        id: 'docker-run',
        category: 'docker',
        title: { zh: '运行容器', en: 'Run a container' },
        description: {
            zh: '后台启动容器、映射端口、设置名称。',
            en: 'Start a detached container with a name and port mapping.',
        },
        command: `docker run -d --name nginx-demo -p 8080:80 nginx:alpine
docker ps
curl -I http://localhost:8080`,
        tags: ['docker', 'run', 'container', 'port', 'nginx'],
    },
    {
        id: 'docker-create-start',
        category: 'docker',
        title: { zh: '创建后再启动容器', en: 'Create then start a container' },
        description: {
            zh: '先创建容器，确认参数后再启动。',
            en: 'Create a container first, then start it after reviewing options.',
        },
        command: `docker create --name web -it -p 8080:80 nginx:alpine
docker start web
docker port web
docker inspect web`,
        tags: ['docker', 'create', 'start', 'inspect', 'port'],
    },
    {
        id: 'docker-logs-shell',
        category: 'docker',
        title: { zh: '查看日志并进入容器', en: 'Read logs and exec shell' },
        description: {
            zh: '排查容器运行日志，进入容器做临时检查。',
            en: 'Inspect runtime logs and open a shell inside a container.',
        },
        command: `docker logs -f --tail=200 <container>

docker exec -it <container> sh`,
        tags: ['docker', 'logs', 'exec', 'shell'],
    },
    {
        id: 'docker-stop-remove',
        category: 'docker',
        title: { zh: '停止和删除容器', en: 'Stop and remove containers' },
        description: { zh: '停止、启动、重启、删除容器。', en: 'Stop, start, restart and remove containers.' },
        command: `docker stop <container>
docker start <container>
docker restart <container>
docker rm <container>
docker rm -f <container>`,
        tags: ['docker', 'container', 'stop', 'remove', 'restart'],
    },
    {
        id: 'docker-copy-diff',
        category: 'docker',
        title: { zh: '容器文件复制和变更', en: 'Copy files and inspect changes' },
        description: {
            zh: '在宿主机和容器间复制文件，查看容器文件层变化。',
            en: 'Copy files between host and container, then inspect filesystem changes.',
        },
        command: `docker cp web:/usr/share/nginx/html/index.html ./index.html
docker cp ./index.html web:/usr/share/nginx/html/index.html
docker diff web`,
        tags: ['docker', 'cp', 'diff', 'file', 'container'],
    },
    {
        id: 'docker-inspect-ip',
        category: 'docker',
        title: { zh: '查看容器详情和 IP', en: 'Inspect container details and IP' },
        description: {
            zh: '读取容器网络、挂载、环境变量等详细信息。',
            en: 'Read container network, mounts, env vars and other details.',
        },
        command: `docker inspect <container>
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container>
docker inspect -f '{{json .Mounts}}' <container>`,
        tags: ['docker', 'inspect', 'ip', 'network', 'mounts'],
    },
    {
        id: 'docker-images',
        category: 'docker',
        title: { zh: '镜像管理', en: 'Image management' },
        description: { zh: '拉取、查看、构建、删除镜像。', en: 'Pull, list, build and remove images.' },
        command: `docker pull nginx:alpine
docker images
docker build -t my-app:latest .
docker rmi <image>
docker image inspect <image>`,
        tags: ['docker', 'image', 'pull', 'build', 'rmi'],
    },
    {
        id: 'docker-image-export',
        category: 'docker',
        title: { zh: '镜像保存和加载', en: 'Save and load images' },
        description: { zh: '离线迁移镜像或给镜像打标签。', en: 'Move images offline or retag images.' },
        command: `docker tag my-app:latest registry.example.com/my-app:v1
docker save my-app:latest > my-app.tar
docker load -i my-app.tar
docker push registry.example.com/my-app:v1`,
        tags: ['docker', 'image', 'tag', 'save', 'load', 'push'],
    },
    {
        id: 'docker-commit',
        category: 'docker',
        title: { zh: '从容器提交镜像', en: 'Commit an image from a container' },
        description: {
            zh: '把容器当前文件系统保存为新镜像。',
            en: 'Save the current container filesystem as a new image.',
        },
        command: `docker commit <container> my-debug-image:latest
docker images
docker run --rm -it my-debug-image:latest sh`,
        note: {
            zh: '生产镜像优先用 Dockerfile 构建，commit 更适合临时排查。',
            en: 'Prefer Dockerfile builds for production images; commit is better for temporary debugging.',
        },
        tags: ['docker', 'commit', 'image', 'debug'],
    },
    {
        id: 'docker-dockerfile-basic',
        category: 'docker',
        title: { zh: 'Dockerfile 常用指令', en: 'Dockerfile common instructions' },
        description: { zh: '最小 Web 应用镜像构建模板。', en: 'Minimal image build template for a web app.' },
        command: `FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]`,
        tags: ['docker', 'dockerfile', 'build', 'cmd', 'copy', 'run'],
    },
    {
        id: 'docker-compose',
        category: 'docker',
        title: { zh: 'Docker Compose 常用操作', en: 'Docker Compose basics' },
        description: { zh: '启动、重建、停止 Compose 服务。', en: 'Start, rebuild and stop Compose services.' },
        command: `docker compose up -d

docker compose up -d --build

docker compose down`,
        tags: ['docker', 'compose', 'up', 'build'],
    },
    {
        id: 'docker-compose-install-legacy',
        category: 'docker',
        title: { zh: '安装旧版 docker-compose', en: 'Install legacy docker-compose' },
        description: {
            zh: '老项目需要 docker-compose v1 命令时使用。',
            en: 'Use this when older projects require docker-compose v1.',
        },
        command: `sudo curl -L https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version`,
        note: {
            zh: '新项目优先使用 Docker 官方 compose 插件，即 docker compose。',
            en: 'Prefer the official Compose plugin, docker compose, for new projects.',
        },
        tags: ['docker', 'compose', 'install', 'legacy'],
    },
    {
        id: 'docker-compose-file',
        category: 'docker',
        title: { zh: 'Compose 文件骨架', en: 'Compose file skeleton' },
        description: {
            zh: '包含镜像、构建、端口、环境变量、卷和依赖。',
            en: 'Includes image, build, ports, env vars, volumes and dependencies.',
        },
        command: `services:
  web:
    build: .
    ports:
      - "8080:80"
    env_file: .env
    volumes:
      - ./app:/app
    depends_on:
      - db
  db:
    image: postgres:16
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data:`,
        tags: ['docker', 'compose', 'yaml', 'ports', 'volumes'],
    },
    {
        id: 'docker-compose-logs',
        category: 'docker',
        title: { zh: 'Compose 日志和服务', en: 'Compose logs and services' },
        description: {
            zh: '查看 Compose 服务状态、日志并进入服务容器。',
            en: 'Inspect Compose service status, logs and exec into a service.',
        },
        command: `docker compose ps
docker compose logs -f --tail=200
docker compose exec <service> sh
docker compose restart <service>`,
        tags: ['docker', 'compose', 'logs', 'service', 'exec'],
    },
    {
        id: 'docker-compose-maintenance',
        category: 'docker',
        title: { zh: 'Compose 维护操作', en: 'Compose maintenance' },
        description: {
            zh: '暂停、恢复、删除服务和查看进程。',
            en: 'Pause, resume, remove services and inspect processes.',
        },
        command: `docker compose pause <service>
docker compose unpause <service>
docker compose rm <service>
docker compose top
docker compose images`,
        tags: ['docker', 'compose', 'pause', 'rm', 'top', 'images'],
    },
    {
        id: 'docker-volumes',
        category: 'docker',
        title: { zh: '数据卷管理', en: 'Volume management' },
        description: {
            zh: '查看、创建、检查和删除 Docker volume。',
            en: 'List, create, inspect and remove Docker volumes.',
        },
        command: `docker volume ls
docker volume create app-data
docker volume inspect app-data
docker volume rm app-data`,
        tags: ['docker', 'volume', 'data'],
    },
    {
        id: 'docker-networks',
        category: 'docker',
        title: { zh: '网络管理', en: 'Network management' },
        description: {
            zh: '查看、创建、连接和检查 Docker 网络。',
            en: 'List, create, connect and inspect Docker networks.',
        },
        command: `docker network ls
docker network create app-net
docker network connect app-net <container>
docker network inspect app-net`,
        tags: ['docker', 'network', 'connect'],
    },
    {
        id: 'docker-stats',
        category: 'docker',
        title: { zh: '容器资源占用', en: 'Container resource usage' },
        description: {
            zh: '查看容器 CPU、内存和 IO 实时占用。',
            en: 'Inspect live container CPU, memory and IO usage.',
        },
        command: `docker stats
docker stats --no-stream
docker top <container>`,
        tags: ['docker', 'stats', 'cpu', 'memory', 'top'],
    },
    {
        id: 'docker-cleanup',
        category: 'docker',
        title: { zh: '清理未使用资源', en: 'Prune unused resources' },
        description: {
            zh: '释放未使用镜像、容器、网络和构建缓存。',
            en: 'Remove unused images, containers, networks and build cache.',
        },
        command: `docker system df

docker system prune -a`,
        note: {
            zh: 'prune 会删除未使用资源，执行前先确认当前主机用途。',
            en: 'prune removes unused resources. Check host usage before running it.',
        },
        tags: ['docker', 'cleanup', 'prune', 'disk'],
    },
    {
        id: 'docker-uninstall',
        category: 'docker',
        title: { zh: '卸载 Docker', en: 'Uninstall Docker' },
        description: {
            zh: '移除 Docker 软件包，可选清理本地数据。',
            en: 'Remove Docker packages and optionally clear local data.',
        },
        command: `sudo apt purge docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras
sudo dnf remove docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras

sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd`,
        note: {
            zh: '最后两行会删除镜像、容器、卷等本地数据。',
            en: 'The last two lines delete local images, containers, volumes and related data.',
        },
        tags: ['docker', 'uninstall', 'remove', 'purge'],
    },
    {
        id: 'systemd-status',
        category: 'systemd',
        title: { zh: '查看服务状态', en: 'Check service status' },
        description: {
            zh: '确认服务是否运行以及最近错误。',
            en: 'See whether a service is running and recent failures.',
        },
        command: `sudo systemctl status nginx

sudo journalctl -u nginx -n 100 --no-pager`,
        tags: ['systemd', 'service', 'status', 'journalctl'],
    },
    {
        id: 'systemd-restart',
        category: 'systemd',
        title: { zh: '启动、重启和开机自启', en: 'Start, restart and enable' },
        description: { zh: '管理服务生命周期和自启动配置。', en: 'Manage service lifecycle and boot startup.' },
        command: `sudo systemctl start <service>

sudo systemctl restart <service>

sudo systemctl enable <service>`,
        tags: ['systemd', 'start', 'restart', 'enable'],
    },
    {
        id: 'systemd-unit-files',
        category: 'systemd',
        title: { zh: '重载 unit 文件', en: 'Reload unit files' },
        description: {
            zh: '修改 service 文件后刷新 systemd 配置。',
            en: 'Refresh systemd after editing service unit files.',
        },
        command: `sudo systemctl daemon-reload

sudo systemctl restart <service>`,
        tags: ['systemd', 'daemon-reload', 'unit'],
    },
    {
        id: 'network-connectivity',
        category: 'network',
        title: { zh: '检查连通性', en: 'Check connectivity' },
        description: { zh: '验证 DNS、HTTP 和端口连通情况。', en: 'Verify DNS, HTTP and TCP port reachability.' },
        command: `ping -c 4 example.com

curl -I https://example.com

nc -vz example.com 443`,
        tags: ['network', 'ping', 'curl', 'nc', 'dns'],
    },
    {
        id: 'network-dns',
        category: 'network',
        title: { zh: '排查 DNS 解析', en: 'Debug DNS resolution' },
        description: { zh: '查看域名解析结果和权威信息。', en: 'Inspect domain resolution and authoritative records.' },
        command: `dig example.com

dig +short example.com

nslookup example.com`,
        tags: ['network', 'dns', 'dig', 'nslookup'],
    },
    {
        id: 'network-sockets',
        category: 'network',
        title: { zh: '查看监听端口', en: 'List listening sockets' },
        description: { zh: '确认本机哪些端口正在监听。', en: 'Check which local ports are listening.' },
        command: `ss -tulpen

sudo lsof -nP -iTCP -sTCP:LISTEN`,
        tags: ['network', 'ports', 'ss', 'lsof'],
    },
];
