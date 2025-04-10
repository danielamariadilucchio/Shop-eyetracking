class AOIManager:
    def __init__(self):
        """
        Inizializza il gestore delle Aree di Interesse (AOI).
        """
        self.aois = []
        
    def define_aoi(self, name, x_min, y_min, width, height):
        """
        Definisce una nuova Area di Interesse.
        
        Args:
            name: Nome identificativo dell'AOI
            x_min, y_min: Coordinate dell'angolo superiore sinistro
            width, height: Larghezza e altezza dell'AOI
            
        Returns:
            Indice dell'AOI creata
        """
        aoi = {
            'name': name,
            'x_min': x_min,
            'y_min': y_min,
            'x_max': x_min + width,
            'y_max': y_min + height,
            'width': width,
            'height': height
        }
        
        self.aois.append(aoi)
        return len(self.aois) - 1
    
    def is_point_in_aoi(self, x, y, aoi_idx):
        """
        Verifica se un punto è all'interno di un'AOI.
        
        Args:
            x, y: Coordinate del punto
            aoi_idx: Indice dell'AOI da controllare
            
        Returns:
            True se il punto è nell'AOI, False altrimenti
        """
        if aoi_idx >= len(self.aois):
            raise ValueError(f"L'indice AOI {aoi_idx} non esiste")
            
        aoi = self.aois[aoi_idx]
        return (aoi['x_min'] <= x <= aoi['x_max']) and (aoi['y_min'] <= y <= aoi['y_max'])
    
    def get_aoi(self, aoi_idx):
        """
        Restituisce i dettagli di un'AOI.
        
        Args:
            aoi_idx: Indice dell'AOI
            
        Returns:
            Dizionario con i dettagli dell'AOI
        """
        if aoi_idx >= len(self.aois):
            raise ValueError(f"L'indice AOI {aoi_idx} non esiste")
            
        return self.aois[aoi_idx]
    
    def get_all_aois(self):
        """
        Restituisce tutte le AOI definite.
        
        Returns:
            Lista di dizionari con tutte le AOI
        """
        return self.aois