# ---------- build stage ----------
FROM golang:1.23-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server .

# ---------- runtime stage ----------
FROM alpine:3.20
# ca-certificates: ต่อ Postgres ผ่าน SSL (Supabase/Neon)
# tzdata: โค้ดเรียก time.LoadLocation("Asia/Bangkok") ต้องมี timezone db
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=build /app/server .
# Render/Cloud Run จะกำหนดพอร์ตจริงผ่าน $PORT; local ไม่ตั้ง = ใช้ default 8000
EXPOSE 8000
CMD ["./server"]
