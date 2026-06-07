package service

import (
	"core_sustain/errs"
	"core_sustain/logs"
	"core_sustain/repository"
	"database/sql"
)

type volcabService struct {
	volcabRepo repository.VolcabtRepository
}

func NewVolcabService(volcabRepo repository.VolcabtRepository) VolcabService {
	return volcabService{volcabRepo: volcabRepo}
}

func (s volcabService) NewVolcab(volcabID int, request NewVolcabRequest) (*VolcabResponse, error) {
	volcab := repository.Volcab{
		ID:         volcabID,
		Word:       request.Word,
		Definition: request.Definition,
	}

	newVolcab, err := s.volcabRepo.CreateVolcab(volcab)
	if err != nil {
		logs.Error(err)
		return nil, errs.NewUnexpectedError()
	}

	response := VolcabResponse{
		ID:         volcabID,
		Word:       newVolcab.Word,
		Definition: newVolcab.Definition,
	}
	return &response, nil
}

func (s volcabService) GetVolcabByID(volcabID int) (*VolcabResponse, error) {
	volcab, err := s.volcabRepo.GetVolcabByID(volcabID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errs.NewNotFoundError("volcab not found")
		}
		logs.Error(err)
		return nil, errs.NewUnexpectedError()
	}

	response := VolcabResponse{
		ID:         volcab.ID,
		Word:       volcab.Word,
		Definition: volcab.Definition,
	}

	return &response, nil
}

func (s volcabService) GetVolcabs() ([]VolcabResponse, error) {
	volcabs, err := s.volcabRepo.GetVolcabs()
	if err != nil {
		logs.Error(err)
		return nil, errs.NewUnexpectedError()
	}

	response := make([]VolcabResponse, 0, len(volcabs))
	for _, volcab := range volcabs {
		response = append(response, VolcabResponse{
			ID:         volcab.ID,
			Word:       volcab.Word,
			Definition: volcab.Definition,
		})
	}
	return response, nil
}

func (s volcabService) UpdateVolcab(volcabID int, request NewVolcabRequest) (*VolcabResponse, error) {
	volcab := repository.Volcab{
		ID:         volcabID,
		Word:       request.Word,
		Definition: request.Definition,
	}

	updatedVolcab, err := s.volcabRepo.UpdateVolcab(volcabID, volcab)
	if err != nil {
		logs.Error(err)
		return nil, errs.NewUnexpectedError()
	}

	response := VolcabResponse{
		ID:         updatedVolcab.ID,
		Word:       updatedVolcab.Word,
		Definition: updatedVolcab.Definition,
	}
	return &response, nil
}

func (s volcabService) DeleteVolcab(volcabID int) error {
	err := s.volcabRepo.DeleteVolcab(volcabID)
	if err != nil {
		logs.Error(err)
		return errs.NewUnexpectedError()
	}
	return nil
}
