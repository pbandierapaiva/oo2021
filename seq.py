

class Seq:
    def __init__(self, pacc='', pseq=''):
        self.seq = pseq
        self.acc = pacc   
    def __del__(self):
        print('destruindo instância')
    def __repr__(self):
        return 'Instância de Seq - '+self.acc
    def __add__(self, s):
        temp = Seq( self.acc + ' ' + s.acc, self.seq + s.seq)
        return temp
    def __iter__(self):
        self.n = 0
        return self
    def __next__(self):
        if self.n >= len(self.seq):
            raise StopIteration
        comeco = self.n
        self.n = self.n+3
        return self.seq[ comeco:comeco+3 ]
    
    
    
    
    
    
    