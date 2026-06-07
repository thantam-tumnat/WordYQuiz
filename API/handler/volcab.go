package handler

import (
	"core_sustain/service"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type volcabHandler struct {
	volcabSrv service.VolcabService
}

func NewVolcabHandler(volcabSrv service.VolcabService) volcabHandler {
	return volcabHandler{volcabSrv: volcabSrv}
}

func (h volcabHandler) NewVolcab(c *fiber.Ctx) error {
	volcabID, _ := strconv.Atoi(c.Params("id"))
	request := service.NewVolcabRequest{}
	err := c.BodyParser(&request)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"Error": "StatusInternalServerError [body parser error]"})
	}
	response, err := h.volcabSrv.NewVolcab(volcabID, request)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"Error": "StatusInternalServerError [instancing NewVolcab failed]"})
	}

	fmt.Println(fiber.StatusCreated)
	return c.JSON(fiber.Map{"Log": fmt.Sprintf("volcab added successfully with id: %v", response.ID)})
}

func (h volcabHandler) GetVolcab(c *fiber.Ctx) error {
	volcabID, _ := strconv.Atoi(c.Params("id"))

	volcab, err := h.volcabSrv.GetVolcabByID(volcabID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"Error": "StatusInternalServerError [cannot GetVolcab]"})
	}

	return c.JSON(volcab)
}

func (h volcabHandler) GetVolcabs(c *fiber.Ctx) error {
	volcabs, err := h.volcabSrv.GetVolcabs()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"Error": "StatusInternalServerError [cannot GetVolcabs]"})
	}

	return c.JSON(volcabs)
}

func (h volcabHandler) UpdateVolcab(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("ID"))
	fmt.Println("PUT working")
	if c.Get("Content-Type") != "application/json" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"Error": "request body incorrect format"})
	}

	request := service.NewVolcabRequest{}
	err := c.BodyParser(&request)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"Error": "StatusInternalServerError [Body Params]"})
	}
	response, err := h.volcabSrv.UpdateVolcab(id, request)
	if err != nil {
		return err
	}
	responses, err := h.volcabSrv.GetVolcabByID(id)
	if err != nil {
		return err
	}
	volcabAfter, err := json.Marshal(responses)
	if err != nil {
		return err
	}

	c.Status(http.StatusCreated).JSON(fiber.Map{
		"Data After Change": string(volcabAfter),
		"Data":              response,
	})
	return nil
}

func (h volcabHandler) DeleteVolcab(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("ID"))
	response, err := h.volcabSrv.GetVolcabByID(id)
	if err != nil {
		return err
	}

	errs := h.volcabSrv.DeleteVolcab(id)
	if errs != nil {
		return errs
	}

	c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": response,
	})
	return nil
}
