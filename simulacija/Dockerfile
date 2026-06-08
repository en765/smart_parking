FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o simulation ./cmd/simulation

FROM scratch
COPY --from=builder /app/simulation /simulation
CMD ["/simulation"]
