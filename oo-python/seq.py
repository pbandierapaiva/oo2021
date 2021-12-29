## Classe Seq para tratar sequências biológicas

class Seq:
	'''Classe Seq para tratar sequências biológicas'''
	contador = 0

	def __init__(self, *args):
		'''Construtor recebe ACC e Sequência ou um objeto Seq'''

		if len(args) == 1:
			if type(args[0]) == Seq:
				self.acc = args[0].acc + '-cópia'
				self.sequencia = args[0].sequencia
			else:
				self.acc = args[0]
				self.sequencia=''
		else:
			if len(args)>2:
				raise TypeError
			
			self.acc = args[0]
			self.sequencia = args[1]
		return
	
		# atributos de instância
#		self.sequencia = parametro_seq
#		self.acc = pacc  
#		Seq.contador+=1
	 
	def __del__(self):
		print('destruindo instância')
	def __repr__(self):
		return 'Instância de Seq - '+self.acc
	def __add__(self, s):
		temp = Seq( self.acc + ' ' + s.acc, self.sequencia + s.sequencia)
		return temp
	def __contains__(self, s):
		return s.sequencia in self.sequencia
	def __iter__(self):
		self.n = 0
		return self
	def __next__(self):
		if self.n >= len(self.sequencia):
		    raise StopIteration
		comeco = self.n
		self.n = self.n+3
		return self.sequencia[ comeco:comeco+3 ]
	def __len__(self):
		return len(self.sequencia)
	#def slice(self, inicio, final, preenche=None):
	#	return self.sequencia[inicio:final]
	def __getitem__(self,k):
		return 	self.sequencia[k]
	def copy(self):
		return Seq(self)
		

class Seqs(str):
	'''Classe Seq baseada na classe str para tratar sequências biológicas'''
	contador = 0

	def __new__(cls, p_acc='', seq=''):   # pacc='', parametro_seq=''):
		
		return str.__new__(cls, seq.upper())
	def __init__(self, s, pacc):
		
		print('passando por init'+s)
		
	def __iter__(self):
		self.n = 0
		return self
	def __next__(self):
		if self.n >= len(self):
		    raise StopIteration
		comeco = self.n
		self.n = self.n+3
		return self[ comeco:comeco+3 ]
		

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


















