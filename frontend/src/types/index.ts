export interface ServerStatus {
  running: boolean;
  domain: string;
  port: string;
  config_count: number;
  uptime: string;
  ram_usage: string;
  cpu_usage: string;
  xray_version: string;
}

export interface Config {
  id: number;
  uuid: string;
  remark: string;
  fingerprint: string;
  http_version: string;
  path: string;
  host: string;
  sni: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConfigRequest {
  remark: string;
  fingerprint: string;
  http_version: string;
  path: string;
  host: string;
  sni: string;
}