package service

type NewHighScoreRequest struct {
	ID         int    `json:"id"`
	PlayerName string `json:"player_name"`
	Score      string `json:"score"`
}

type HighScoreResponse struct {
	ID         int    `json:"id"`
	PlayerName string `json:"player_name"`
	Score      string `json:"score"`
}

type HighScoreService interface {
	NewHighScore(int, NewHighScoreRequest) (*HighScoreResponse, error)
	GetHighScoreByID(int) (*HighScoreResponse, error)
	GetHighScores() ([]HighScoreResponse, error)
	UpdateHighScore(int, NewHighScoreRequest) (*HighScoreResponse, error)
	DeleteHighScore(int) error
}
