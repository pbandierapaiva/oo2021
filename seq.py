## Classe Seq para tratar sequências biológicas

class Seq:
	'''Classe Seq para tratar sequências biológicas'''
	contador = 0
	def __init__(self, pacc='', parametro_seq=''):
		'''Construtor recebe ACCESSION e Sequência'''
		# atributos de instância
		self.sequencia = parametro_seq
		self.acc = pacc  
		Seq.contador+=1
	 
	def __del__(self):
		print('destruindo instância')
	def __repr__(self):
		return 'Instância de Seq - '+self.acc
	def __add__(self, s):
		temp = Seq( self.acc + ' ' + s.acc, self.sequencia + s.sequencia)
		return temp
	def __iter__(self):
		self.n = 0
		return self
	def __contains__(self, s):
		return s.sequencia in self.sequencia
	def __next__(self):
		if self.n >= len(self.sequencia):
		    raise StopIteration
		comeco = self.n
		self.n = self.n+3
		return self.sequencia[ comeco:comeco+3 ]

class SeqList(list):
	def __init__(self):
		list.__init__(self)
	def leFasta(self, nome_arq):
		a = open(nome_arq)
		while(True):
			linha = a.readline()
			if(linha==''):
				break
			if linha[0] == '>':
				temp = Seq(linha[1:])
				self.append(temp)
			else:
				temp.sequencia += linha.strip() 
	def __repr__(self):
		return 'Instância de SeqList com %d instâncias de Seq'%self.__len__()






