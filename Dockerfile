FROM nginx:alpine

# Install curl for health check
RUN apk add --no-cache curl

# Copy nginx base configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/_base.conf /etc/nginx/conf.d/default.conf

# Copy module nginx configs (built by build-nginx.sh)
COPY nginx/conf.d/modules/ /etc/nginx/conf.d/modules/

# Copy web content
COPY html/ /usr/share/nginx/html/

# Copy modules metadata and UI
COPY modules/ /usr/share/nginx/html/modules/

# Copy test files
COPY test-files/ /usr/share/nginx/html/test-files/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
