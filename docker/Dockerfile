FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates

# Download go mod and sum
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy source code
COPY backend/ .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /app/server ./cmd/server

# Xray installation stage
FROM alpine:3.20 AS xray-installer

# Install wget and ca-certificates
RUN apk add --no-cache wget ca-certificates

# Download and install Xray
ARG XRAY_VERSION=1.8.1
RUN wget -qO- https://github.com/XTLS/Xray-core/releases/download/v${XRAY_VERSION}/Xray-linux-64.tar.gz \
    | tar xz -C /tmp \
    && mv /tmp/xray /usr/local/bin/xray \
    && chmod +x /usr/local/bin/xray \
    && mkdir -p /etc/xray \
    && mkdir -p /var/log/xray

# Final stage
FROM alpine:3.20

# Install ca-certificates and tzdata
RUN apk add --no-cache ca-certificates tzdata

# Copy from builder
COPY --from=builder /app/server /app/server

# Copy from xray-installer
COPY --from=xray-installer /usr/local/bin/xray /usr/local/bin/xray
COPY --from=xray-installer /etc/xray /etc/xray
COPY --from=xray-installer /var/log/xray /var/log/xray

# Create necessary directories
RUN mkdir -p /app/data /app/frontend/dist

# Copy xray config template
COPY xray/config.template.json /etc/xray/config.json

# Expose port
EXPOSE 8080

# Create non-root user
RUN addgroup -g 1000 -S appgroup && adduser -S appuser -G appgroup -u 1000
USER appuser

# Environment variables
ENV PATH="/app:${PATH}"

# Start script
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Working directory
WORKDIR /app

# Start the application
ENTRYPOINT ["/app/start.sh"]