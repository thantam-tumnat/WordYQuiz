package repository

type HighScore struct {
	ID         int    `db:"id" gorm:"not null"`
	PlayerName string `db:"playername"`
	Score      string `db:"score"`
	Mode       string `db:"mode" json:"mode"`
}
type HighScoreRepository interface {
	CreateHighScore(HighScore) (*HighScore, error)
	UpdateHighScore(int, HighScore) (*HighScore, error)
	GetHighScoreByID(int) (*HighScore, error)
	GetHighScores(string) ([]HighScore, error)
	DeleteHighScore(int) error
}
