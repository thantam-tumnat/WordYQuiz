package main

import (
	"core_sustain/handler"
	"core_sustain/logs"
	"core_sustain/repository"
	"core_sustain/service"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"

	_ "github.com/go-sql-driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/spf13/viper"
)

func main() {
	initTimeZone()
	initConfig()
	db := initDatabase()
	fmt.Println("connected db as ", viper.GetString("db.database"))

	VolcabRespositoryDB := repository.NewVolcabRepositoryDB(db)
	VolcabService := service.NewVolcabService(VolcabRespositoryDB)
	VolcabHandler := handler.NewVolcabHandler(VolcabService)

	HighScoreRepositoryDB := repository.NewHighScoreRepositoryDB(db)
	HighScoreService := service.NewHighScoreService(HighScoreRepositoryDB)
	HighScoreHandler := handler.NewHighScoreHandler(HighScoreService)

	app := fiber.New()

	app.Use(cors.New())
	fmt.Println(time.Now())
	app.Use(func(c *fiber.Ctx) error {
		// ตั้งค่า header สำหรับ CORS
		c.Set("Access-Control-Allow-Origin", "*")
		c.Set("Content-Type", "application/json")
		c.Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length")

		// ผ่าน middleware ต่อไป
		if err := c.Next(); err != nil {
			return err
		}

		logs.Info(fmt.Sprintf("API: %s, code: %v, Method %s", c.Path(), c.Response().StatusCode(), c.Method()))
		logs.Info(fmt.Sprintf("Response body: %s", c.Response().Body()))
		fmt.Sprintf("%s", c.Response().Body())

		return nil
	})

	app.Get("/volcabs", VolcabHandler.GetVolcabs)
	app.Get("/volcabs/:id", VolcabHandler.GetVolcab)
	app.Post("/volcabs", VolcabHandler.NewVolcab)
	app.Delete("/volcabs/:id", VolcabHandler.DeleteVolcab)
	app.Put("/volcabs/:id", VolcabHandler.UpdateVolcab)

	app.Get("/score", HighScoreHandler.GetHighScores)
	app.Get("/score/:id", HighScoreHandler.GetHighScore)
	app.Post("/score", HighScoreHandler.NewHighScore)
	app.Delete("/score/:id", HighScoreHandler.DeleteHighScore)
	app.Put("/score/:id", HighScoreHandler.UpdateHighScore)

	// $PORT (Render/Cloud Run กำหนด) มาก่อนเสมอ ไม่งั้นใช้ app.port จาก config/default
	port := viper.GetString("app.port")
	if p := os.Getenv("PORT"); p != "" {
		port = p
	}

	logs.Info("Quiz service started at port " + port)

	if err := app.Listen(":" + port); err != nil {
		panic(err)
	}

}

func initConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")

	// อ่านจาก environment variables: APP_PORT, DB_HOST, DB_PORT, DB_USERNAME, ...
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()
	// Render/Cloud Run ส่งพอร์ตที่ต้อง listen มาทาง $PORT
	viper.BindEnv("app.port", "PORT")

	// ค่าเริ่มต้น (ใช้เมื่อไม่มีทั้งไฟล์และ env)
	viper.SetDefault("app.port", "8000")
	viper.SetDefault("db.port", "5432")
	viper.SetDefault("db.sslmode", "disable")

	// ตอน dev จะมี config.yaml; บน cloud ไม่มีไฟล์ → ใช้ env แทน (ไม่ panic)
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			fmt.Println("no config.yaml found — using environment variables")
		} else {
			panic(err)
		}
	}
}

func initTimeZone() {
	ict, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		panic(err)
	}

	time.Local = ict

}

func initDatabase() *gorm.DB {
	dsn := fmt.Sprintf("host=%v port=%v user=%v password=%v dbname=%v sslmode=%v",
		viper.GetString("db.host"),
		viper.GetInt("db.port"),
		viper.GetString("db.username"),
		viper.GetString("db.password"),
		viper.GetString("db.database"),
		viper.GetString("db.sslmode"), // disable=local docker · require=Supabase/Neon
	)
	dial := postgres.Open(dsn)

	db, err := gorm.Open(dial, &gorm.Config{
		//Logger: &SqlLogger{},
		DryRun: false,
	})
	if err != nil {
		panic(err)
	}
	err = db.AutoMigrate(&repository.Volcab{})
	if err != nil {
		panic(err)
	}
	return db
}

type SqlLogger struct {
	logger.Interface
}
