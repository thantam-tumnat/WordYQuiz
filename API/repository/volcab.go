package repository

type Volcab struct {
	ID           int    `db:"id" gorm:"not null"`
	Word         string `db:"word"`
	Definition   string `db:"definition"`
	PartOfSpeech string `db:"part_of_speech"`
	Level        string `db:"level"`
}
type VolcabtRepository interface {
	CreateVolcab(Volcab) (*Volcab, error)
	UpdateVolcab(int, Volcab) (*Volcab, error)
	GetVolcabByID(int) (*Volcab, error)
	GetVolcabs() ([]Volcab, error)
	DeleteVolcab(int) error
}
