package service

type NewHighScoreRequest struct {
	ID         int    `json:"id"`
	PlayerName string `json:"player_name"`
	Score      string `json:"score"`
	Mode       string `json:"mode"`
}

type HighScoreResponse struct {
	ID         int    `json:"id"`
	PlayerName string `json:"player_name"`
	Score      string `json:"score"`
	Mode       string `json:"mode"`
}

type HighScoreService interface {
	NewHighScore(int, NewHighScoreRequest) (*HighScoreResponse, error)
	GetHighScoreByID(int) (*HighScoreResponse, error)
	GetHighScores(string) ([]HighScoreResponse, error)
	UpdateHighScore(int, NewHighScoreRequest) (*HighScoreResponse, error)
	DeleteHighScore(int) error
}
