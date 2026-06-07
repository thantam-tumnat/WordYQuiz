package service

import (
	"core_sustain/errs"
	"core_sustain/logs"
	"core_sustain/repository"
	"database/sql"
)

type highscoreService struct {
	highscoreRepo repository.HighScoreRepository
}

func NewHighScoreService(highscoreRepo repository.HighScoreRepository) HighScoreService {
	return highscoreService{highscoreRepo: highscoreRepo}
}

func (s highscoreService) NewHighScore(highscoreID int, request NewHighScoreRequest) (*HighScoreResponse, error) {
	highscore := repository.HighScore{
		ID:         highscoreID,
		PlayerName: request.PlayerName,
		Score:      request.Score,
	}

	newHighScore, err := s.highscoreRepo.CreateHighScore(highscore)
	if err != nil {
		logs.Error(err)
		return nil, errs.NewUnexpectedError()
	}

	response := HighScoreResponse{
		ID:         highscoreID,
		PlayerName: newHighScore.PlayerName,
		Score:      newHighScore.Score,
	}
	return &response, nil
}

func (s highscoreService) GetHighScoreByID(highscoreID int) (*HighScoreResponse, error) {
	highscore, err := s.highscoreRepo.GetHighScoreByID(highscoreID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errs.NewNotFoundError("highscore not found")
		}
		logs.Error(err)
		return nil, errs.NewUnexpectedError()
	}

	response := HighScoreResponse{
		ID:         highscore.ID,
		PlayerName: highscore.PlayerName,
		Score:      highscore.Score,
	}

	return &response, nil
}

func (s highscoreService) GetHighScores() ([]HighScoreResponse, error) {
	highscores, err := s.highscoreRepo.GetHighScores()
	if err != nil {
		logs.Error(err)
		return nil, errs.NewUnexpectedError()
	}

	response := make([]HighScoreResponse, 0, len(highscores))
	for _, highscore := range highscores {
		response = append(response, HighScoreResponse{
			ID:         highscore.ID,
			PlayerName: highscore.PlayerName,
			Score:      highscore.Score,
		})
	}
	return response, nil
}

func (s highscoreService) UpdateHighScore(highscoreID int, request NewHighScoreRequest) (*HighScoreResponse, error) {
	highscore := repository.HighScore{
		ID:         highscoreID,
		PlayerName: request.PlayerName,
		Score:      request.Score,
	}

	updatedHighScore, err := s.highscoreRepo.UpdateHighScore(highscoreID, highscore)
	if err != nil {
		logs.Error(err)
		return nil, errs.NewUnexpectedError()
	}

	response := HighScoreResponse{
		ID:         updatedHighScore.ID,
		PlayerName: updatedHighScore.PlayerName,
		Score:      updatedHighScore.Score,
	}
	return &response, nil
}

func (s highscoreService) DeleteHighScore(highscoreID int) error {
	err := s.highscoreRepo.DeleteHighScore(highscoreID)
	if err != nil {
		logs.Error(err)
		return errs.NewUnexpectedError()
	}
	return nil
}
