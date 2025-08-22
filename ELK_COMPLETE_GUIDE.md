# 📚 ELK Stack Complete Guide - Library Management System

## 🎯 Mục lục
1. [Tổng quan ELK Stack](#tổng-quan-elk-stack)
2. [Elasticsearch Commands](#elasticsearch-commands)
3. [Logstash Configuration](#logstash-configuration)
4. [Kibana Operations](#kibana-operations)
5. [Docker/Podman Commands](#dockerpodman-commands)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Advanced Queries](#advanced-queries)

---

## 🔍 Tổng quan ELK Stack

### **Elasticsearch** - Search & Analytics Engine
- **Port**: 9200 (HTTP API), 9300 (Transport)
- **Function**: Lưu trữ, tìm kiếm, phân tích dữ liệu
- **Data Format**: JSON documents
- **Index**: Tương đương database/table

### **Logstash** - Data Processing Pipeline
- **Port**: 5044 (Beats input), 9600 (Monitoring)
- **Function**: Thu thập, xử lý, chuyển đổi log
- **Components**: Input → Filter → Output

### **Kibana** - Visualization Dashboard
- **Port**: 5601
- **Function**: Tạo dashboard, visualization, query interface
- **Features**: Discover, Dashboard, Canvas, Maps

---

## 🔧 Elasticsearch Commands

### **🏥 Cluster Management**

```bash
# Kiểm tra trạng thái cluster
curl -X GET "localhost:9200/_cluster/health?pretty"

# Thông tin node
curl -X GET "localhost:9200/_nodes?pretty"

# Thống kê cluster
curl -X GET "localhost:9200/_cluster/stats?pretty"

# Cài đặt cluster
curl -X GET "localhost:9200/_cluster/settings?pretty"
```

### **📋 Index Management**

```bash
# Liệt kê tất cả indices
curl -X GET "localhost:9200/_cat/indices?v"

# Tạo index mới
curl -X PUT "localhost:9200/my-index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}'

# Xóa index
curl -X DELETE "localhost:9200/index-name"

# Xem mapping của index
curl -X GET "localhost:9200/index-name/_mapping?pretty"

# Cập nhật mapping
curl -X PUT "localhost:9200/index-name/_mapping" -H 'Content-Type: application/json' -d'
{
  "properties": {
    "new_field": {
      "type": "keyword"
    }
  }
}'

# Thông tin index
curl -X GET "localhost:9200/index-name/_settings?pretty"
```

### **📊 Document Operations**

```bash
# Đếm documents
curl -X GET "localhost:9200/index-name/_count?pretty"

# Lấy document theo ID
curl -X GET "localhost:9200/index-name/_doc/document-id?pretty"

# Tạo document mới
curl -X POST "localhost:9200/index-name/_doc" -H 'Content-Type: application/json' -d'
{
  "title": "Sample Document",
  "timestamp": "2025-08-22T10:00:00Z",
  "level": "INFO"
}'

# Cập nhật document
curl -X POST "localhost:9200/index-name/_update/document-id" -H 'Content-Type: application/json' -d'
{
  "doc": {
    "status": "updated"
  }
}'

# Xóa document
curl -X DELETE "localhost:9200/index-name/_doc/document-id"
```

### **🔍 Search Queries**

#### **Basic Search:**
```bash
# Tìm kiếm đơn giản
curl -X GET "localhost:9200/library-logs-*/_search?q=level:INFO&pretty"

# Tìm kiếm với size limit
curl -X GET "localhost:9200/library-logs-*/_search?size=10&pretty"

# Tìm kiếm với sort
curl -X GET "localhost:9200/library-logs-*/_search?sort=@timestamp:desc&pretty"
```

#### **Advanced Search:**
```bash
# Match query
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "message": "Spring Boot"
    }
  },
  "size": 5
}'

# Boolean query
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        {"match": {"level": "INFO"}},
        {"range": {"@timestamp": {"gte": "now-1h"}}}
      ],
      "must_not": [
        {"match": {"logger_name": "springframework"}}
      ]
    }
  }
}'

# Wildcard search
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "wildcard": {
      "message": "*book*"
    }
  }
}'

# Fuzzy search
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "fuzzy": {
      "message": {
        "value": "application",
        "fuzziness": "AUTO"
      }
    }
  }
}'
```

#### **Time Range Queries:**
```bash
# Last 24 hours
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-24h"
      }
    }
  }
}'

# Specific time range
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "range": {
      "@timestamp": {
        "gte": "2025-08-22T00:00:00Z",
        "lte": "2025-08-22T23:59:59Z"
      }
    }
  }
}'
```

### **📈 Aggregations**

```bash
# Terms aggregation
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "log_levels": {
      "terms": {
        "field": "level.keyword",
        "size": 10
      }
    }
  }
}'

# Date histogram
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "logs_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "hour"
      }
    }
  }
}'

# Multi-level aggregation
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "by_level": {
      "terms": {
        "field": "level.keyword"
      },
      "aggs": {
        "by_logger": {
          "terms": {
            "field": "logger_name.keyword",
            "size": 3
          }
        }
      }
    }
  }
}'

# Stats aggregation
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "level_value_stats": {
      "stats": {
        "field": "level_value"
      }
    }
  }
}'
```

---

## ⚙️ Logstash Configuration

### **📝 Input Plugins**

```ruby
# File input
input {
  file {
    path => "/var/log/spring-app.log"
    start_position => "end"
    sincedb_path => "/usr/share/logstash/data/sincedb"
    codec => json
    discover_interval => 15
    stat_interval => 1
  }
}

# Beats input
input {
  beats {
    port => 5044
  }
}

# TCP input
input {
  tcp {
    port => 5000
    codec => json
  }
}

# HTTP input
input {
  http {
    port => 8080
  }
}

# Stdin input (for testing)
input {
  stdin { }
}
```

### **🔄 Filter Plugins**

```ruby
# Grok parsing
filter {
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:msg}" }
  }
}

# Date parsing
filter {
  date {
    match => [ "timestamp", "yyyy-MM-dd HH:mm:ss" ]
    target => "@timestamp"
  }
}

# Mutate fields
filter {
  mutate {
    add_field => { "environment" => "production" }
    remove_field => [ "host" ]
    uppercase => [ "level" ]
    gsub => [ "message", "\n", " " ]
  }
}

# JSON parsing
filter {
  json {
    source => "message"
    target => "parsed"
  }
}

# Conditional processing
filter {
  if [level] == "ERROR" {
    mutate {
      add_tag => [ "error", "alert" ]
    }
  }
}
```

### **📤 Output Plugins**

```ruby
# Elasticsearch output
output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "library-logs-%{+YYYY.MM.dd}"
    template_name => "library_template"
  }
}

# File output
output {
  file {
    path => "/var/log/logstash-output.log"
    codec => line { format => "%{message}" }
  }
}

# Stdout output (for debugging)
output {
  stdout {
    codec => rubydebug
  }
}

# Conditional output
output {
  if [level] == "ERROR" {
    email {
      to => "admin@company.com"
      subject => "Error in application"
      body => "Error message: %{message}"
    }
  }
}
```

### **🔧 Logstash Commands**

```bash
# Test configuration
logstash --config.test_and_exit -f /etc/logstash/conf.d/logstash.conf

# Run with specific config
logstash -f /etc/logstash/conf.d/logstash.conf

# Reload configuration
curl -X POST "localhost:9600/_node/reload"

# Get pipeline stats
curl -X GET "localhost:9600/_node/stats/pipelines?pretty"

# Get node info
curl -X GET "localhost:9600/_node?pretty"
```

---

## 📊 Kibana Operations

### **🔗 Access URLs**
```bash
# Main interface
http://localhost:5601

# Dev Tools (Console)
http://localhost:5601/app/dev_tools#/console

# Management
http://localhost:5601/app/management
```

### **🔍 Query Examples for Discover**

```lucene
# Basic search
level:INFO

# AND operator
level:INFO AND message:book

# OR operator
level:ERROR OR level:WARN

# NOT operator
NOT level:DEBUG

# Wildcard
message:Spring*

# Range queries
level_value:[20000 TO 40000]
@timestamp:[2025-08-22 TO 2025-08-23]

# Phrase search
message:"Spring Boot application"

# Field exists
_exists_:logger_name

# Regex
message:/.*book.*/
```

### **📈 Kibana Visualizations**

#### **1. Line Chart (Logs over time)**
```json
{
  "index": "library-logs-*",
  "timeField": "@timestamp",
  "metrics": [
    {
      "type": "count"
    }
  ],
  "buckets": [
    {
      "type": "date_histogram",
      "field": "@timestamp",
      "interval": "1h"
    }
  ]
}
```

#### **2. Pie Chart (Log levels distribution)**
```json
{
  "index": "library-logs-*",
  "metrics": [
    {
      "type": "count"
    }
  ],
  "buckets": [
    {
      "type": "terms",
      "field": "level.keyword",
      "size": 10
    }
  ]
}
```

#### **3. Data Table (Top loggers)**
```json
{
  "index": "library-logs-*",
  "metrics": [
    {
      "type": "count"
    }
  ],
  "buckets": [
    {
      "type": "terms",
      "field": "logger_name.keyword",
      "size": 10
    }
  ]
}
```

---

## 🐳 Docker/Podman Commands

### **📦 Container Management**

```bash
# Start all services
podman-compose up -d

# Start specific service
podman-compose up -d elasticsearch

# Stop services
podman-compose down

# Restart service
podman-compose restart logstash

# View logs
podman logs -f library-elasticsearch
podman logs -f library-logstash
podman logs -f library-kibana

# Container status
podman ps
podman ps -a

# Resource usage
podman stats

# Execute command in container
podman exec -it library-elasticsearch bash
```

### **🔧 Volume Management**

```bash
# List volumes
podman volume ls

# Inspect volume
podman volume inspect pgdata
podman volume inspect esdata

# Remove volume (DANGER: Data loss!)
podman volume rm pgdata

# Backup volume
podman run --rm -v esdata:/data -v $(pwd):/backup alpine tar czf /backup/esdata-backup.tar.gz -C /data .

# Restore volume
podman run --rm -v esdata:/data -v $(pwd):/backup alpine tar xzf /backup/esdata-backup.tar.gz -C /data
```

---

## 🔧 Troubleshooting

### **🚨 Common Issues**

#### **Elasticsearch**
```bash
# Check cluster health
curl -X GET "localhost:9200/_cluster/health?pretty"

# Check node status
curl -X GET "localhost:9200/_cat/nodes?v"

# Check indices status
curl -X GET "localhost:9200/_cat/indices?v&health=red"

# Increase heap size (in docker-compose.yml)
environment:
  - ES_JAVA_OPTS=-Xms2g -Xmx2g
```

#### **Logstash**
```bash
# Test configuration syntax
podman exec library-logstash logstash --config.test_and_exit -f /etc/logstash/conf.d/logstash.conf

# Check pipeline status
curl -X GET "localhost:9600/_node/stats/pipelines?pretty"

# Debug mode (in docker-compose.yml)
environment:
  - LOG_LEVEL=debug
```

#### **Kibana**
```bash
# Check Kibana status
curl -X GET "localhost:5601/api/status"

# Clear browser cache
# Restart Kibana container
podman-compose restart kibana
```

### **⚡ Performance Tuning**

```bash
# Elasticsearch
# - Increase heap size: ES_JAVA_OPTS=-Xms4g -Xmx4g
# - Disable swapping: bootstrap.memory_lock=true
# - Optimize index settings:
curl -X PUT "localhost:9200/library-logs-*/_settings" -H 'Content-Type: application/json' -d'
{
  "index": {
    "refresh_interval": "30s",
    "number_of_replicas": 0
  }
}'

# Logstash
# - Increase workers: pipeline.workers: 4
# - Increase batch size: pipeline.batch.size: 1000
# - Tune memory: LS_JAVA_OPTS=-Xms2g -Xmx2g
```

---

## 🏆 Best Practices

### **📏 Index Management**
```bash
# Use index templates
curl -X PUT "localhost:9200/_index_template/library-logs" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["library-logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "refresh_interval": "30s"
    },
    "mappings": {
      "properties": {
        "@timestamp": {"type": "date"},
        "level": {"type": "keyword"},
        "message": {"type": "text"},
        "logger_name": {"type": "keyword"}
      }
    }
  }
}'

# Index lifecycle management
curl -X PUT "localhost:9200/_ilm/policy/library-logs-policy" -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "5gb",
            "max_age": "7d"
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'
```

### **🔒 Security**
```yaml
# docker-compose.yml security settings
elasticsearch:
  environment:
    - xpack.security.enabled=true
    - ELASTIC_PASSWORD=strongpassword
    
kibana:
  environment:
    - ELASTICSEARCH_USERNAME=elastic
    - ELASTICSEARCH_PASSWORD=strongpassword
```

### **📊 Monitoring**
```bash
# Monitor cluster health
watch -n 30 'curl -s localhost:9200/_cluster/health?pretty'

# Monitor index size
curl -X GET "localhost:9200/_cat/indices?v&s=store.size:desc"

# Monitor slow queries
curl -X GET "localhost:9200/_nodes/stats/indices/search?pretty"
```

---

## 🎓 Advanced Queries

### **📊 Complex Aggregations**

```bash
# Multi-metric aggregation
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "error_analysis": {
      "filter": {
        "term": {"level.keyword": "ERROR"}
      },
      "aggs": {
        "top_errors": {
          "terms": {
            "field": "logger_name.keyword",
            "size": 5
          },
          "aggs": {
            "sample_messages": {
              "top_hits": {
                "size": 3,
                "_source": ["message", "@timestamp"],
                "sort": [{"@timestamp": {"order": "desc"}}]
              }
            }
          }
        }
      }
    }
  }
}'

# Percentile aggregation
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "response_time_percentiles": {
      "percentiles": {
        "field": "level_value",
        "percents": [50, 90, 95, 99]
      }
    }
  }
}'
```

### **🔍 Advanced Search Patterns**

```bash
# Nested boolean query
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "should": [
        {
          "bool": {
            "must": [
              {"term": {"level.keyword": "ERROR"}},
              {"range": {"@timestamp": {"gte": "now-1h"}}}
            ]
          }
        },
        {
          "bool": {
            "must": [
              {"term": {"level.keyword": "WARN"}},
              {"wildcard": {"message": "*exception*"}}
            ]
          }
        }
      ],
      "minimum_should_match": 1
    }
  }
}'

# Function score query
curl -X GET "localhost:9200/library-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "function_score": {
      "query": {"match_all": {}},
      "functions": [
        {
          "filter": {"term": {"level.keyword": "ERROR"}},
          "weight": 3
        },
        {
          "filter": {"range": {"@timestamp": {"gte": "now-1h"}}},
          "weight": 2
        }
      ],
      "score_mode": "sum"
    }
  }
}'
```

---

## 📞 Quick Reference

### **🔗 Important URLs**
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601  
- **Logstash Monitoring**: http://localhost:9600
- **Spring Boot App**: http://localhost:8080

### **📁 Important Files**
- **docker-compose.yml**: Container configuration
- **logstash/config/logstash.conf**: Logstash pipeline
- **logstash/pipeline/spring-app.log**: Application logs
- **src/main/resources/logback-spring.xml**: Spring logging config

### **🚀 Quick Start Commands**
```bash
# 1. Start ELK Stack
podman-compose up -d

# 2. Start Spring Boot
mvn spring-boot:run

# 3. Check data in Elasticsearch
curl "localhost:9200/library-logs-*/_count?pretty"

# 4. Open Kibana
firefox http://localhost:5601
```

---

**📝 Ghi chú**: Document này bao gồm tất cả commands và configurations cần thiết để làm việc với ELK Stack. Bookmark và sử dụng như reference guide khi cần thiết!

---

*🎯 Created for Library Management System - ELK Stack Learning Journey*
