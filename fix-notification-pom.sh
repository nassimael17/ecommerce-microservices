#!/usr/bin/env bash
set -e

ROOT="$(pwd)"
POM="$ROOT/notification-service/notification-service/pom.xml"

if ! grep -q "spring-boot-starter-web" "$POM"; then
  echo "✅ Adding spring-boot-starter-web to notification-service"

  sed -i '/<dependencies>/a\
    <dependency>\n\
      <groupId>org.springframework.boot</groupId>\n\
      <artifactId>spring-boot-starter-web</artifactId>\n\
    </dependency>\n' "$POM"
else
  echo "ℹ️ spring-boot-starter-web already present"
fi

echo "✅ notification-service pom fixed"
