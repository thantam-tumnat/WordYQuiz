package main

import (
	"core_sustain/handler"
	"core_sustain/logs"
	"core_sustain/repository"
	"core_sustain/service"
	"fmt"
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

	logs.Info("Quiz service started at port " + viper.GetString("app.port"))

	app.Listen(":8000")

}

func initConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	err := viper.ReadInConfig()
	if err != nil {
		panic(err)
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
	dsn := fmt.Sprintf("host=%v port=%v user=%v password=%v dbname=%v",
		viper.GetString("db.host"),
		viper.GetInt("db.port"),
		viper.GetString("db.username"),
		viper.GetString("db.password"),
		viper.GetString("db.database"),
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
