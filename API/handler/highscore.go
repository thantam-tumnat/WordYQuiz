package handler

import (
	"core_sustain/service"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type highscoreHandler struct {
	highscoreSrv service.HighScoreService
}

func NewHighScoreHandler(highscoreSrv service.HighScoreService) highscoreHandler {
	return highscoreHandler{highscoreSrv: highscoreSrv}
}

func (h highscoreHandler) NewHighScore(c *fiber.Ctx) error {
	highscoreID, _ := strconv.Atoi(c.Params("id"))
	request := service.NewHighScoreRequest{}
	err := c.BodyParser(&request)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"Error": "StatusInternalServerError [body parser error]"})
	}
	response, err := h.highscoreSrv.NewHighScore(highscoreID, request)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"Error": "StatusInternalServerError [instancing NewHighScore failed]"})
	}

	fmt.Println(fiber.StatusCreated)
	return c.JSON(fiber.Map{"Log": fmt.Sprintf("highscore added successfully with id: %v", response.ID)})
}

func (h highscoreHandler) GetHighScore(c *fiber.Ctx) error {
	highscoreID, _ := strconv.Atoi(c.Params("id"))

	highscore, err := h.highscoreSrv.GetHighScoreByID(highscoreID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"Error": "StatusInternalServerError [cannot GetHighScore]"})
	}

	return c.JSON(highscore)
}

func (h highscoreHandler) GetHighScores(c *fiber.Ctx) error {
	highscores, err := h.highscoreSrv.GetHighScores()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"Error": "StatusInternalServerError [cannot GetHighScores]"})
	}

	return c.JSON(highscores)
}

func (h highscoreHandler) UpdateHighScore(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("ID"))
	fmt.Println("PUT working")
	if c.Get("Content-Type") != "application/json" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"Error": "request body incorrect format"})
	}

	request := service.NewHighScoreRequest{}
	err := c.BodyParser(&request)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"Error": "StatusInternalServerError [Body Params]"})
	}
	response, err := h.highscoreSrv.UpdateHighScore(id, request)
	if err != nil {
		return err
	}
	responses, err := h.highscoreSrv.GetHighScoreByID(id)
	if err != nil {
		return err
	}
	highscoreAfter, err := json.Marshal(responses)
	if err != nil {
		return err
	}

	c.Status(http.StatusCreated).JSON(fiber.Map{
		"Data After Change": string(highscoreAfter),
		"Data":              response,
	})
	return nil
}

func (h highscoreHandler) DeleteHighScore(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("ID"))
	response, err := h.highscoreSrv.GetHighScoreByID(id)
	if err != nil {
		return err
	}

	errs := h.highscoreSrv.DeleteHighScore(id)
	if errs != nil {
		return errs
	}

	c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": response,
	})
	return nil
}
