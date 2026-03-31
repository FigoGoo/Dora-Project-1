package util

import (
	"strconv"
	"time"
)

// StringToUint64 将字符串转换为 uint64
func StringToUint64(s string) (uint64, error) {
	if s == "" {
		return 0, nil
	}
	return strconv.ParseUint(s, 10, 64)
}

// StringToUint64OrZero 将字符串转换为 uint64，失败时返回 0
func StringToUint64OrZero(s string) uint64 {
	if s == "" {
		return 0
	}
	v, err := strconv.ParseUint(s, 10, 64)
	if err != nil {
		return 0
	}
	return v
}

// Uint64ToString 将 uint64 转换为字符串
func Uint64ToString(v uint64) string {
	return strconv.FormatUint(v, 10)
}

// Int32ToInt 将 int32 转换为 int
func Int32ToInt(v int32) int {
	return int(v)
}

// IntToInt32 将 int 转换为 int32
func IntToInt32(v int) int32 {
	return int32(v)
}

// FormatTimeToString 将 time.Time 格式化为 RFC3339 字符串
func FormatTimeToString(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.Format(time.RFC3339)
}

// ParseStringToTime 将 RFC3339 字符串解析为 time.Time
func ParseStringToTime(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, nil
	}
	return time.Parse(time.RFC3339, s)
}
