package service

type NewVolcabRequest struct {
	ID           int    `json:"id"`
	Word         string `json:"word"`
	Definition   string `json:"definition"`
	PartOfSpeech string `json:"part_of_speech"`
	Level        string `json:"level"`
}

type VolcabResponse struct {
	ID           int    `json:"id"`
	Word         string `json:"word"`
	Definition   string `json:"definition"`
	PartOfSpeech string `json:"part_of_speech"`
	Level        string `json:"level"`
}

type VolcabService interface {
	NewVolcab(int, NewVolcabRequest) (*VolcabResponse, error)
	GetVolcabByID(int) (*VolcabResponse, error)
	GetVolcabs() ([]VolcabResponse, error)
	UpdateVolcab(int, NewVolcabRequest) (*VolcabResponse, error)
	DeleteVolcab(int) error
}
